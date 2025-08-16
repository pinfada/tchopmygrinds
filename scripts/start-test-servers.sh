#!/bin/bash

# Script pour démarrer automatiquement les serveurs pour les tests E2E
# Usage: ./scripts/start-test-servers.sh

set -e

echo "🚀 Démarrage des serveurs pour les tests E2E - TchopMyGrinds"
echo "============================================================"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
RAILS_PORT=3000
REACT_PORT=3001
BACKEND_PID_FILE="/tmp/tchopmygrinds_rails.pid"
FRONTEND_PID_FILE="/tmp/tchopmygrinds_react.pid"

# Fonction pour afficher les messages colorés
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] 📋${NC} $1"
}

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port utilisé
    else
        return 1  # Port libre
    fi
}

# Fonction pour arrêter un processus par PID file
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "Arrêt de $service_name (PID: $pid)"
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                warn "Forçage de l'arrêt de $service_name"
                kill -9 "$pid"
            fi
        fi
        rm -f "$pid_file"
    fi
}

# Fonction pour attendre qu'un service soit disponible
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    info "Attente de $service_name sur $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            log "$service_name est accessible ✅"
            return 0
        fi
        
        if [ $attempt -eq 1 ]; then
            echo -n "    Tentatives: "
        fi
        echo -n "$attempt "
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    error "$service_name n'est pas accessible après ${max_attempts} tentatives"
    return 1
}

# Fonction pour nettoyer lors de l'arrêt du script
cleanup() {
    echo ""
    warn "Arrêt des services..."
    stop_process "$BACKEND_PID_FILE" "Rails"
    stop_process "$FRONTEND_PID_FILE" "React"
    exit 0
}

# Trap pour nettoyer lors de Ctrl+C
trap cleanup SIGINT SIGTERM

# Vérification des prérequis
info "Vérification des prérequis..."

if ! command -v rails >/dev/null 2>&1; then
    error "Rails n'est pas installé"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    error "npm n'est pas installé"
    exit 1
fi

if [ ! -d "frontend" ]; then
    error "Dossier frontend non trouvé"
    exit 1
fi

# Vérifier si les services sont déjà en cours d'exécution
if check_port $RAILS_PORT; then
    warn "Port $RAILS_PORT déjà utilisé. Un serveur Rails est peut-être déjà en cours d'exécution."
    if curl -s -f "http://localhost:$RAILS_PORT/api/v1/commerces" >/dev/null 2>&1; then
        log "Serveur Rails déjà accessible ✅"
        RAILS_RUNNING=true
    else
        error "Port $RAILS_PORT utilisé mais API non accessible"
        exit 1
    fi
else
    RAILS_RUNNING=false
fi

if check_port $REACT_PORT; then
    warn "Port $REACT_PORT déjà utilisé. Un serveur React est peut-être déjà en cours d'exécution."
    if curl -s -f "http://localhost:$REACT_PORT" >/dev/null 2>&1; then
        log "Serveur React déjà accessible ✅"
        REACT_RUNNING=true
    else
        error "Port $REACT_PORT utilisé mais serveur non accessible"
        exit 1
    fi
else
    REACT_RUNNING=false
fi

# Créer les données de test si nécessaire
info "Vérification des données de test..."
if rails runner "User.find_by(email: 'admin@test.com')" >/dev/null 2>&1; then
    log "Données de test déjà présentes ✅"
else
    log "Création des données de test..."
    rails runner db/seeds_test_users_simple.rb
fi

# Démarrer Rails si nécessaire
if [ "$RAILS_RUNNING" = false ]; then
    log "Démarrage du serveur Rails sur le port $RAILS_PORT..."
    rails server -p $RAILS_PORT -d
    
    # Attendre que Rails soit disponible
    if wait_for_service "http://localhost:$RAILS_PORT/api/v1/commerces" "Rails API"; then
        log "Serveur Rails démarré avec succès ✅"
    else
        error "Impossible de démarrer le serveur Rails"
        exit 1
    fi
fi

# Démarrer React si nécessaire
if [ "$REACT_RUNNING" = false ]; then
    log "Démarrage du serveur React sur le port $REACT_PORT..."
    
    # Aller dans le dossier frontend
    cd frontend
    
    # Démarrer en arrière-plan
    npm run dev -- --port $REACT_PORT --host localhost > /tmp/react_server.log 2>&1 &
    REACT_PID=$!
    echo $REACT_PID > "$FRONTEND_PID_FILE"
    
    # Revenir au dossier racine
    cd ..
    
    # Attendre que React soit disponible
    if wait_for_service "http://localhost:$REACT_PORT" "React"; then
        log "Serveur React démarré avec succès ✅"
    else
        error "Impossible de démarrer le serveur React"
        stop_process "$FRONTEND_PID_FILE" "React"
        exit 1
    fi
fi

echo ""
log "🎉 Tous les services sont opérationnels !"
echo "============================================================"
log "🔗 Backend Rails:  http://localhost:$RAILS_PORT"
log "🔗 Frontend React: http://localhost:$REACT_PORT"
echo "============================================================"
log "📋 Vous pouvez maintenant exécuter les tests:"
log "   npm run test:baseline"
log "   npm run test:regression" 
log "   npm run test:auth"
echo "============================================================"

# Si des services ont été démarrés par ce script, attendre
if [ "$RAILS_RUNNING" = false ] || [ "$REACT_RUNNING" = false ]; then
    log "Services démarrés par ce script. Appuyez sur Ctrl+C pour arrêter."
    
    # Attendre indéfiniment
    while true; do
        sleep 10
        
        # Vérifier que les services sont toujours actifs
        if [ "$RAILS_RUNNING" = false ] && ! check_port $RAILS_PORT; then
            error "Le serveur Rails s'est arrêté de manière inattendue"
            break
        fi
        
        if [ "$REACT_RUNNING" = false ] && ! check_port $REACT_PORT; then
            error "Le serveur React s'est arrêté de manière inattendue"
            break
        fi
    done
fi
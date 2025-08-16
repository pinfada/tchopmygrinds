#!/bin/bash

# Script de déploiement sécurisé avec tests de régression
# Usage: ./scripts/deploy-with-tests.sh [environment]

set -e  # Arrêter en cas d'erreur

# Configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "[$timestamp] $level $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Fonction de nettoyage en cas d'interruption
cleanup() {
    log "INFO" "Nettoyage en cours..."
    # Arrêter les processus de test s'ils tournent encore
    pkill -f "rails server" || true
    pkill -f "npm run dev" || true
    log "INFO" "Nettoyage terminé"
}

# Trap pour nettoyage automatique
trap cleanup EXIT INT TERM

# Vérification des prérequis
check_prerequisites() {
    log "INFO" "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier Ruby
    if ! command -v ruby &> /dev/null; then
        log "ERROR" "Ruby n'est pas installé"
        exit 1
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log "ERROR" "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier que nous sommes dans un repo Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "Ce script doit être exécuté dans un repository Git"
        exit 1
    fi
    
    log "SUCCESS" "Prérequis validés"
}

# Vérification de l'état du repository
check_git_status() {
    log "INFO" "Vérification de l'état Git..."
    
    # Vérifier qu'il n'y a pas de modifications non commitées
    if ! git diff --quiet; then
        log "ERROR" "Des modifications non commitées sont présentes"
        log "INFO" "Veuillez commiter ou stasher vos modifications avant le déploiement"
        exit 1
    fi
    
    # Vérifier qu'on est sur la bonne branche
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        log "WARNING" "Déploiement en production depuis la branche '$CURRENT_BRANCH'"
        read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Déploiement annulé par l'utilisateur"
            exit 0
        fi
    fi
    
    log "SUCCESS" "État Git validé (branche: $CURRENT_BRANCH)"
}

# Installation des dépendances
install_dependencies() {
    log "INFO" "Installation des dépendances..."
    
    cd "$PROJECT_DIR"
    
    # Dépendances Node.js
    log "INFO" "Installation des dépendances Node.js..."
    npm ci --production=false
    
    # Dépendances Ruby
    log "INFO" "Installation des dépendances Ruby..."
    bundle install
    
    log "SUCCESS" "Dépendances installées"
}

# Build de l'application
build_application() {
    log "INFO" "Build de l'application..."
    
    cd "$PROJECT_DIR"
    
    # Build du frontend
    log "INFO" "Build du frontend React..."
    npm run build:css
    npm run build:react
    
    # Precompilation des assets Rails
    log "INFO" "Precompilation des assets Rails..."
    RAILS_ENV=$ENVIRONMENT bundle exec rails assets:precompile
    
    log "SUCCESS" "Build terminé"
}

# Démarrage des serveurs pour les tests
start_test_servers() {
    log "INFO" "Démarrage des serveurs pour les tests..."
    
    cd "$PROJECT_DIR"
    
    # Démarrer Rails en arrière-plan
    RAILS_ENV=test bundle exec rails server -p 3000 &
    RAILS_PID=$!
    
    # Démarrer le serveur frontend en arrière-plan
    npm run preview -- --port 3001 &
    FRONTEND_PID=$!
    
    # Attendre que les serveurs démarrent
    log "INFO" "Attente du démarrage des serveurs..."
    sleep 30
    
    # Vérifier que les serveurs répondent
    if ! curl -f http://localhost:3000/api/v1/commerces > /dev/null 2>&1; then
        log "ERROR" "Le serveur Rails ne répond pas"
        kill $RAILS_PID $FRONTEND_PID || true
        exit 1
    fi
    
    if ! curl -f http://localhost:3001 > /dev/null 2>&1; then
        log "ERROR" "Le serveur frontend ne répond pas"
        kill $RAILS_PID $FRONTEND_PID || true
        exit 1
    fi
    
    # Sauvegarder les PIDs pour le nettoyage
    echo $RAILS_PID > /tmp/deploy_rails.pid
    echo $FRONTEND_PID > /tmp/deploy_frontend.pid
    
    log "SUCCESS" "Serveurs de test démarrés"
}

# Arrêt des serveurs de test
stop_test_servers() {
    log "INFO" "Arrêt des serveurs de test..."
    
    if [ -f /tmp/deploy_rails.pid ]; then
        RAILS_PID=$(cat /tmp/deploy_rails.pid)
        kill $RAILS_PID || true
        rm /tmp/deploy_rails.pid
    fi
    
    if [ -f /tmp/deploy_frontend.pid ]; then
        FRONTEND_PID=$(cat /tmp/deploy_frontend.pid)
        kill $FRONTEND_PID || true
        rm /tmp/deploy_frontend.pid
    fi
    
    log "SUCCESS" "Serveurs de test arrêtés"
}

# Exécution des tests de régression
run_regression_tests() {
    log "INFO" "Exécution des tests de régression..."
    
    cd "$PROJECT_DIR"
    
    # Créer le dossier de logs s'il n'existe pas
    mkdir -p logs
    
    # Exécuter les tests de régression
    if npm run test:regression; then
        log "SUCCESS" "Tests de régression réussis"
        return 0
    else
        log "ERROR" "Tests de régression échoués"
        
        # Afficher le rapport si disponible
        if [ -f "tests/reports/latest-summary.json" ]; then
            log "INFO" "Résumé des tests:"
            cat tests/reports/latest-summary.json | jq '.summary' || cat tests/reports/latest-summary.json
        fi
        
        return 1
    fi
}

# Déploiement effectif
deploy_to_environment() {
    log "INFO" "Déploiement vers l'environnement $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "production")
            deploy_to_production
            ;;
        "staging")
            deploy_to_staging
            ;;
        *)
            log "ERROR" "Environnement '$ENVIRONMENT' non supporté"
            exit 1
            ;;
    esac
}

# Déploiement en production (Render.com)
deploy_to_production() {
    log "INFO" "Déploiement en production sur Render.com..."
    
    # Pousser vers la branche principale
    git push origin HEAD
    
    # Si vous avez configuré des webhooks Render ou des deploy keys
    # Le déploiement se fera automatiquement
    
    log "SUCCESS" "Code poussé vers production. Déploiement automatique en cours sur Render.com"
    log "INFO" "Surveillez https://render.com pour le statut du déploiement"
}

# Déploiement en staging
deploy_to_staging() {
    log "INFO" "Déploiement en staging..."
    
    # Logique de déploiement staging
    git push origin HEAD:staging
    
    log "SUCCESS" "Déploiement staging terminé"
}

# Fonction principale
main() {
    log "INFO" "🚀 Début du déploiement sécurisé vers $ENVIRONMENT"
    log "INFO" "Timestamp: $(date)"
    log "INFO" "Git commit: $(git rev-parse --short HEAD)"
    
    # Étapes du déploiement
    check_prerequisites
    check_git_status
    install_dependencies
    build_application
    
    # Tests de régression
    start_test_servers
    
    if run_regression_tests; then
        log "SUCCESS" "✅ Tests de régression réussis - Déploiement autorisé"
        stop_test_servers
        deploy_to_environment
        log "SUCCESS" "🎉 Déploiement terminé avec succès!"
    else
        log "ERROR" "❌ Tests de régression échoués - Déploiement bloqué"
        stop_test_servers
        
        log "INFO" "Actions possibles:"
        log "INFO" "1. Corriger les régressions et recommencer"
        log "INFO" "2. Forcer le déploiement avec --force (non recommandé)"
        log "INFO" "3. Mettre à jour la baseline avec npm run test:baseline"
        
        exit 1
    fi
}

# Gestion des arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Usage: $0 [environment] [options]"
        echo ""
        echo "Environments:"
        echo "  production  Déploie en production (défaut)"
        echo "  staging     Déploie en staging"
        echo ""
        echo "Options:"
        echo "  --help, -h  Affiche cette aide"
        echo ""
        echo "Exemples:"
        echo "  $0                    # Déploie en production"
        echo "  $0 staging           # Déploie en staging"
        exit 0
        ;;
esac

# Créer le dossier de logs
mkdir -p "$(dirname "$LOG_FILE")"

# Exécution
main "$@"
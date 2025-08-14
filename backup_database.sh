#!/bin/bash

# TchopMyGrinds Database Backup Script
# Crée une sauvegarde complète avant migration Rails 7.1

echo "🔄 Démarrage du backup de la base de données TchopMyGrinds..."

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="tchopmygrinds_development"
BACKUP_FILE="$BACKUP_DIR/tchopmygrinds_backup_$DATE.sql"

# Créer le répertoire de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Backup de la base de données
echo "📁 Création du backup: $BACKUP_FILE"
pg_dump $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup créé avec succès: $BACKUP_FILE"
    
    # Compresser le backup
    gzip $BACKUP_FILE
    echo "🗜️  Backup compressé: $BACKUP_FILE.gz"
    
    # Afficher la taille
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "📊 Taille du backup: $BACKUP_SIZE"
    
    echo "✅ Backup terminé avec succès!"
else
    echo "❌ Erreur lors du backup de la base de données"
    exit 1
fi
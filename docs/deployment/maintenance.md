# Documentation Déploiement - Maintenance

## Tâches de Maintenance Courantes

### Monitoring de l'Application

#### Vérification de Santé

```bash
# Vérification du statut HTTP
curl -I https://tchopmygrinds.onrender.com/
# Réponse attendue: HTTP/1.1 200 OK

# Test de l'API de base
curl https://tchopmygrinds.onrender.com/serveraddress
# Réponse: {"ip": "xxx.xxx.xxx.xxx"}

# Test géolocalisation
curl "https://tchopmygrinds.onrender.com/commerces/listcommerce?latitude=45.764&longitude=4.8357&distance=10"
```

#### Monitoring des Logs

```bash
# Via Render Dashboard
# - Accéder à l'application → onglet "Logs"
# - Filtrer par niveau (ERROR, WARN, INFO)
# - Surveiller les patterns d'erreur

# Erreurs critiques à surveiller :
# - 500 Internal Server Error
# - Database connection errors  
# - SendGrid delivery failures
# - Geocoding API timeouts
```

### Maintenance Base de Données

#### Backup et Restauration

```bash
# Backup manuel (si accès direct à la DB)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restoration depuis backup
psql $DATABASE_URL < backup_file.sql

# Via Render (automatique)
# Les backups sont gérés automatiquement par Render
# Rétention : Plan gratuit = 7 jours, plans payants = plus long
```

#### Maintenance des Données

```ruby
# lib/tasks/maintenance.rake
namespace :maintenance do
  desc "Nettoyer les sessions expirées"
  task cleanup_sessions: :environment do
    # Si utilisation de sessions en DB
    ActiveRecord::SessionStore::Session
      .where("updated_at < ?", 1.week.ago)
      .delete_all
      
    puts "Sessions expirées supprimées"
  end
  
  desc "Nettoyer les commandes abandonnées"  
  task cleanup_abandoned_orders: :environment do
    abandoned_orders = Order.where(
      status: 'Waiting',
      created_at: ..30.minutes.ago
    )
    
    count = abandoned_orders.count
    abandoned_orders.update_all(status: 'Cancelled')
    
    puts "#{count} commandes abandonnées annulées"
  end
  
  desc "Vérifier l'intégrité géospatiale"
  task check_geocoding: :environment do
    commerces_without_coords = Commerce.where(
      latitude: nil
    ).or(Commerce.where(longitude: nil))
    
    if commerces_without_coords.any?
      puts "⚠️  #{commerces_without_coords.count} commerces sans coordonnées"
      
      commerces_without_coords.each do |commerce|
        if commerce.adresse.present?
          commerce.geocode
          if commerce.save
            puts "✅ Géocodé: #{commerce.nom}"
          else
            puts "❌ Échec: #{commerce.nom}"
          end
        end
      end
    else
      puts "✅ Tous les commerces sont géocodés"
    end
  end
  
  desc "Statistiques de l'application"
  task stats: :environment do
    puts "=== Statistiques TchopMyGrinds ==="
    puts "Utilisateurs total: #{User.count}"
    puts "  - Vendeurs: #{User.where(seller_role: true).count}"
    puts "  - Acheteurs: #{User.where(buyer_role: true).count}"
    puts "  - Admins: #{User.where(admin: true).count}"
    puts
    puts "Commerces total: #{Commerce.count}"
    puts "  - Itinérants: #{Commerce.joins(:user).where(users: {statut_type: 'itinerant'}).count}"
    puts "  - Sédentaires: #{Commerce.joins(:user).where(users: {statut_type: 'sedentary'}).count}"
    puts
    puts "Produits total: #{Product.count}"
    puts "  - En stock: #{Product.where('unitsinstock > 0').count}"
    puts "  - Rupture: #{Product.where(unitsinstock: 0).count}"
    puts
    puts "Commandes total: #{Order.count}"
    Order.group(:status).count.each do |status, count|
      puts "  - #{status}: #{count}"
    end
    puts
    puts "Newsletter: #{Newsletter.where(subscribed: true).count} abonnés"
  end
end
```

### Optimisation Performance

#### Nettoyage des Actifs

```bash
# Nettoyage des anciens actifs précompilés
bundle exec rails assets:clean

# Précompilation complète (si problème)
bundle exec rails assets:clobber
bundle exec rails assets:precompile
```

#### Optimisation Base de Données

```sql
-- Analyse des performances (requêtes lentes)
-- Via console PostgreSQL ou Rails console

-- Index manquants potentiels
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY n_distinct DESC;

-- Taille des tables
SELECT 
  schemaname as schema,
  tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

```ruby
# Console Rails - Analyse des requêtes lentes
# rails console --environment=production

# Activer le log des requêtes
ActiveRecord::Base.logger = Logger.new(STDOUT)

# Identifier les requêtes N+1
# Utiliser bullet gem en développement pour détecter

# Optimisation des requêtes géospatiales
Commerce.includes(:user, :products)
  .where("latitude IS NOT NULL AND longitude IS NOT NULL")
  .limit(100)
```

### Surveillance Système

#### Métriques à Surveiller

```ruby
# lib/tasks/health_check.rake
namespace :health do
  desc "Vérification complète de santé"
  task check: :environment do
    checks = []
    
    # Test connexion DB
    begin
      ActiveRecord::Base.connection.execute("SELECT 1")
      checks << "✅ Base de données: OK"
    rescue => e
      checks << "❌ Base de données: #{e.message}"
    end
    
    # Test géocodage
    begin
      result = Geocoder.search("Lyon, France", limit: 1)
      if result.any?
        checks << "✅ Géocodage: OK"
      else
        checks << "⚠️  Géocodage: Pas de résultats"
      end
    rescue => e
      checks << "❌ Géocodage: #{e.message}"
    end
    
    # Test envoi email
    begin
      ActionMailer::Base.mail(
        to: ENV['ADMIN_EMAIL'],
        from: 'noreply@tchopmygrinds.com',
        subject: 'Health Check',
        body: 'Test automatique - système OK'
      ).deliver_now
      
      checks << "✅ Email: OK"
    rescue => e
      checks << "❌ Email: #{e.message}"
    end
    
    # Statistiques mémoire (approximatives)
    memory_usage = `ps -o pid,vsz,rss -p #{Process.pid}`.split("\n")[1]
    checks << "ℹ️  Mémoire: #{memory_usage}"
    
    puts checks.join("\n")
  end
end
```

### Gestion des Erreurs

#### Surveillance des Erreurs 500

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  # Gestion globale des erreurs en production
  unless Rails.application.config.consider_all_requests_local
    rescue_from StandardError, with: :handle_exception
    rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
    rescue_from ActionController::RoutingError, with: :handle_not_found
  end
  
  private
  
  def handle_exception(exception)
    # Log détaillé de l'erreur
    Rails.logger.error "Exception: #{exception.class} - #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    
    # Notification d'erreur (à implémenter selon besoins)
    ErrorNotifier.notify(exception) if defined?(ErrorNotifier)
    
    render json: { error: "Une erreur s'est produite" }, status: 500
  end
  
  def handle_not_found(exception)
    render json: { error: "Ressource non trouvée" }, status: 404
  end
end
```

#### Retry Logic pour Services Externes

```ruby
# app/services/geocoding_service.rb
class GeocodingService
  RETRY_ATTEMPTS = 3
  RETRY_DELAY = 2 # secondes
  
  def self.geocode_address(address)
    attempts = 0
    
    begin
      attempts += 1
      result = Geocoder.search(address, limit: 1).first
      
      unless result
        raise GeocodingError, "Aucun résultat pour: #{address}"
      end
      
      {
        latitude: result.latitude,
        longitude: result.longitude,
        formatted_address: result.display_name
      }
      
    rescue => e
      Rails.logger.warn "Geocoding attempt #{attempts} failed: #{e.message}"
      
      if attempts < RETRY_ATTEMPTS
        sleep(RETRY_DELAY * attempts)
        retry
      else
        Rails.logger.error "Geocoding failed after #{attempts} attempts: #{address}"
        raise e
      end
    end
  end
  
  class GeocodingError < StandardError; end
end
```

### Mise à Jour et Déploiement

#### Procédure de Déploiement

```bash
# 1. Tests en local
rails test
rails spec # si RSpec

# 2. Vérification assets
rails assets:precompile RAILS_ENV=production
rails assets:clean

# 3. Test migration sur copie de DB
rails db:migrate:status
rails db:migrate --dry-run # si disponible

# 4. Commit et push
git add .
git commit -m "Deploy: description des changements"
git push origin master

# 5. Surveillance post-déploiement
# - Vérifier logs sur Render
# - Tester fonctionnalités critiques
# - Surveiller métriques performance
```

#### Rollback d'Urgence

```bash
# Rollback rapide via Git
git log --oneline -10  # Identifier le bon commit
git revert HEAD        # Annuler le dernier commit
git push origin master # Déclencher re-déploiement

# Ou rollback vers version spécifique
git reset --hard <commit-hash>
git push --force origin master

# ⚠️ Attention aux migrations de DB non réversibles
```

### Sauvegarde et Archivage

#### Scripts de Sauvegarde

```ruby
# lib/tasks/backup.rake
namespace :backup do
  desc "Sauvegarde complète des données"
  task full: :environment do
    timestamp = Time.current.strftime("%Y%m%d_%H%M%S")
    backup_dir = Rails.root.join('tmp', 'backups', timestamp)
    FileUtils.mkdir_p(backup_dir)
    
    # Export des données principales
    models = [User, Commerce, Product, Order, OrderDetail, Address]
    
    models.each do |model|
      filename = "#{backup_dir}/#{model.table_name}.json"
      
      File.open(filename, 'w') do |file|
        file.write(model.all.to_json)
      end
      
      puts "✅ Exporté #{model.name}: #{model.count} enregistrements"
    end
    
    puts "Sauvegarde complète dans: #{backup_dir}"
  end
  
  desc "Export CSV des données métier"
  task csv_export: :environment do
    require 'csv'
    
    timestamp = Time.current.strftime("%Y%m%d_%H%M%S")
    
    # Export commerces avec géolocalisation
    CSV.open("tmp/commerces_#{timestamp}.csv", "w") do |csv|
      csv << ["ID", "Nom", "Ville", "Latitude", "Longitude", "Vendeur", "Produits"]
      
      Commerce.includes(:user, :products).each do |commerce|
        csv << [
          commerce.id,
          commerce.nom,
          commerce.ville,
          commerce.latitude,
          commerce.longitude,
          commerce.user.name,
          commerce.products.count
        ]
      end
    end
    
    puts "Export CSV commerces terminé"
  end
end
```

### Monitoring Automatisé

#### Cron Jobs de Maintenance

```ruby
# Si utilisation de whenever gem ou cron
# config/schedule.rb

# Nettoyage quotidien
every 1.day, at: '2:00 am' do
  rake 'maintenance:cleanup_sessions'
  rake 'maintenance:cleanup_abandoned_orders'
end

# Vérification hebdomadaire
every 1.week, at: '3:00 am' do
  rake 'maintenance:check_geocoding'
  rake 'health:check'
end

# Statistiques mensuelles  
every '1st', at: '1:00 am' do
  rake 'maintenance:stats'
  rake 'backup:csv_export'
end
```

La maintenance régulière assure la stabilité et les performances optimales de l'application TchopMyGrinds en production.
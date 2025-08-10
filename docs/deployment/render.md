# Documentation Déploiement - Render.com

## Configuration de Déploiement

TchopMyGrinds est déployé sur **Render.com**, une plateforme cloud moderne qui offre un déploiement simplifié pour les applications Ruby on Rails.

### Fichier de Configuration Principal

**`render.yaml`** - Configuration déclarative du déploiement :

```yaml
# render.yaml
databases:
  - name: tchopmygrinds-db
    databaseName: tchopmygrinds_production
    user: tchopmygrinds
    plan: free # Plan gratuit PostgreSQL

services:
  - type: web
    name: tchopmygrinds-web
    env: ruby
    plan: free # Plan gratuit (limité)
    buildCommand: "./bin/render-build.sh"
    startCommand: "bundle exec rails server"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: tchopmygrinds-db
          property: connectionString
      - key: RAILS_MASTER_KEY
        sync: false # Défini manuellement dans le dashboard
      - key: RAILS_ENV
        value: production
      - key: RACK_ENV  
        value: production
```

## Script de Build

**`bin/render-build.sh`** - Script d'installation et compilation :

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

# Installation des dépendances Ruby
bundle install

# Précompilation des actifs Rails (CSS, JS, images)
bundle exec rails assets:precompile

# Nettoyage des anciens actifs pour économiser l'espace
bundle exec rails assets:clean

# Exécution des migrations de base de données
bundle exec rails db:migrate
```

**Permissions** :
```bash
# Rendre le script exécutable
chmod +x bin/render-build.sh
```

## Variables d'Environnement

### Variables Obligatoires

1. **`RAILS_MASTER_KEY`** - Clé de chiffrement Rails
   - Contenu du fichier `config/master.key`
   - Utilisé pour déchiffrer `config/credentials.yml.enc`
   - **Critique** : Ne jamais committer cette clé

2. **`DATABASE_URL`** - URL de connexion PostgreSQL
   - Générée automatiquement par Render
   - Format : `postgresql://user:password@host:port/database`

3. **`RAILS_ENV=production`** - Environnement Rails

4. **`RACK_ENV=production`** - Environnement Rack

### Variables Optionnelles

```bash
# Configuration email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_USERNAME=apikey

# Configuration géocodage (si API key requise)  
GEOCODER_API_KEY=your_geocoding_api_key

# Configuration applicative
MAX_SEARCH_RADIUS=100  # km
DEFAULT_SEARCH_RADIUS=50  # km
```

## Configuration Base de Données

### PostgreSQL sur Render

```ruby
# config/database.yml - Production
production:
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  url: <%= ENV['DATABASE_URL'] %>
  # Render PostgreSQL spécifique
  sslmode: require
```

### Migrations en Production

```bash
# Lors du déploiement - automatique via render-build.sh
bundle exec rails db:migrate

# Migration manuelle si nécessaire
heroku run rails db:migrate # Si migration depuis Heroku
# ou directement sur Render console
```

## Configuration des Actifs (Assets)

### Précompilation

```ruby
# config/environments/production.rb
Rails.application.configure do
  # Précompilation des actifs
  config.assets.compile = false
  config.assets.digest = true
  
  # Gestion des erreurs d'actifs manquants
  config.assets.unknown_asset_fallback = false
  
  # Compression
  config.assets.compress = true
  config.assets.js_compressor = :uglifier
  config.assets.css_compressor = :sass
  
  # CDN (si configuré)
  # config.asset_host = "https://cdn.example.com"
end
```

### Assets Pipeline avec Bower

```javascript
// app/assets/javascripts/application.js
//= require jquery
//= require bootstrap-sprockets  
//= require angular
//= require angular-route
//= require leaflet
//= require_tree ./partials
//= require_tree ./Templates
```

## Fichier de Configuration Render

### Services Web

```yaml
services:
  - type: web
    name: tchopmygrinds-web
    env: ruby
    plan: free
    region: oregon # Région US par défaut
    buildCommand: "./bin/render-build.sh"
    startCommand: "bundle exec rails server"
    
    # Configuration du serveur
    numInstances: 1  # Plan gratuit = 1 instance max
    
    # Santé de l'application
    healthCheckPath: "/"
    
    # Variables d'environnement
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: tchopmygrinds-db
          property: connectionString
      - key: RAILS_MASTER_KEY
        sync: false
      - key: RAILS_ENV
        value: production
      - key: RACK_ENV
        value: production
      - key: NODE_ENV
        value: production
```

## Limitations du Plan Gratuit

### Contraintes Techniques

- **Instance unique** : Pas de load balancing
- **RAM limitée** : 512 MB maximum
- **CPU partagé** : Performance variable
- **Stockage** : Limité, nettoyage automatique des logs
- **Base de données** : PostgreSQL 1GB max
- **Trafic** : Bande passante limitée

### Recommandations d'Optimisation

```ruby
# config/environments/production.rb
Rails.application.configure do
  # Réduction de l'utilisation mémoire
  config.cache_classes = true
  config.eager_load = true
  
  # Logging minimal
  config.log_level = :warn
  config.logger = ActiveSupport::Logger.new(STDOUT)
  
  # Cache en mémoire (limité par la RAM)
  config.cache_store = :memory_store, { size: 32.megabytes }
  
  # Compression des réponses
  config.middleware.use Rack::Deflater
end
```

## Déploiement et Mise à Jour

### Processus de Déploiement

1. **Push sur GitHub** - Render surveille la branche principale
2. **Détection automatique** - Nouveau commit déclenche le build
3. **Exécution build** - `./bin/render-build.sh` est exécuté
4. **Démarrage** - Application redémarrée avec la nouvelle version

### Commandes de Déploiement

```bash
# Déploiement depuis GitHub
git add .
git commit -m "Production deployment"
git push origin master  # Déclenche le déploiement automatique

# Vérification du statut
# Via dashboard Render.com ou logs
```

### Rollback en Cas d'Erreur

```bash
# Via Git - revenir au commit précédent
git revert HEAD
git push origin master

# Ou reset vers un commit spécifique  
git reset --hard <commit-hash>
git push --force origin master
```

## Monitoring et Logs

### Accès aux Logs

```bash
# Logs en temps réel via Render Dashboard
# Section "Logs" de l'application

# Types de logs disponibles :
# - Build logs (pendant déploiement)
# - Runtime logs (application en cours)  
# - System logs (infrastructure)
```

### Métriques de Performance

- **Response time** : Temps de réponse moyen
- **Memory usage** : Utilisation RAM
- **CPU usage** : Utilisation processeur  
- **Request throughput** : Nombre de requêtes/minute

## Configuration Email (SendGrid)

### Intégration Production

```ruby
# config/environments/production.rb
Rails.application.configure do
  config.action_mailer.delivery_method = :sendgrid_actionmailer
  config.action_mailer.sendgrid_actionmailer_settings = {
    api_key: ENV['SENDGRID_API_KEY'],
    raise_delivery_errors: true
  }
  
  # URL de base pour les emails
  config.action_mailer.default_url_options = { 
    host: 'tchopmygrinds.onrender.com' 
  }
end
```

## Sécurité en Production

### Configuration HTTPS

```ruby
# config/environments/production.rb
Rails.application.configure do
  # Force HTTPS
  config.force_ssl = true
  
  # Headers de sécurité
  config.ssl_options = { 
    hsts: { 
      expires: 31536000, 
      includeSubdomains: true 
    } 
  }
end
```

### Protection des Données

```ruby
# Filtrage des paramètres sensibles dans les logs
Rails.application.configure do
  config.filter_parameters += [
    :password, :password_confirmation,
    :email, :credit_card, :ssn
  ]
end
```

## Troubleshooting Courant

### Erreurs de Build

```bash
# Erreur : Bundle install failed
# Solution : Vérifier Gemfile.lock compatible avec production

# Erreur : Assets precompilation failed  
# Solution : Vérifier les dépendances JS/CSS dans application.js

# Erreur : Database migration failed
# Solution : Vérifier les migrations et contraintes de DB
```

### Erreurs Runtime

```bash
# Erreur 500 : Internal Server Error
# Vérifier : RAILS_MASTER_KEY configurée correctement

# Erreur de base de données
# Vérifier : DATABASE_URL et connexions réseau

# Erreur de géolocalisation
# Vérifier : Limitations de l'API de géocodage
```

### Optimisation Performance

```ruby
# Configuration pour environnement contraint
# config/application.rb
config.autoload_paths += %W(#{config.root}/app/services)

# Préchargement sélectif  
config.eager_load_paths -= %W(
  #{config.root}/app/admin
  #{config.root}/app/jobs
)
```

Le déploiement sur Render.com offre une solution simple et efficace pour héberger l'application TchopMyGrinds avec un minimum de configuration manuelle.
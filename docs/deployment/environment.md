# Documentation Déploiement - Variables d'Environnement

## Gestion des Configurations

TchopMyGrinds utilise plusieurs approches pour gérer la configuration selon l'environnement.

### Hiérarchie des Configurations

```
1. Variables d'environnement système (ENV)
2. Rails Credentials (credentials.yml.enc) 
3. Figaro (config/application.yml) - Développement
4. Valeurs par défaut dans le code
```

## Variables Critiques

### 1. RAILS_MASTER_KEY

**Utilisation** : Déchiffrement des credentials Rails

```bash
# Production (Render.com)
RAILS_MASTER_KEY=your_32_character_master_key_here

# Développement - créer le fichier
echo "your_master_key" > config/master.key
git add config/master.key
git update-index --assume-unchanged config/master.key
```

**Génération** :
```bash
# Génération automatique
rails new:credentials

# Ou génération manuelle
ruby -e "require 'securerandom'; puts SecureRandom.hex(16)"
```

### 2. DATABASE_URL

**Format** : `postgresql://user:password@host:port/database`

```bash
# Production (Render)
DATABASE_URL=postgresql://user:pass@host:5432/tchopmygrinds_production

# Développement local
DATABASE_URL=postgresql://localhost/tchopmygrinds_development

# Test
DATABASE_URL=postgresql://localhost/tchopmygrinds_test
```

### 3. RAILS_ENV / RACK_ENV

```bash
# Production
RAILS_ENV=production
RACK_ENV=production

# Développement  
RAILS_ENV=development
RACK_ENV=development

# Test
RAILS_ENV=test
RACK_ENV=test
```

## Configuration Email (SendGrid)

### Variables SendGrid

```bash
# API SendGrid
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_USERNAME=apikey

# Configuration SMTP alternative
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Configuration dans Rails

```ruby
# config/environments/production.rb
Rails.application.configure do
  config.action_mailer.delivery_method = :sendgrid_actionmailer
  config.action_mailer.sendgrid_actionmailer_settings = {
    api_key: ENV['SENDGRID_API_KEY'],
    raise_delivery_errors: true,
    return_response: true
  }
  
  config.action_mailer.default_url_options = {
    host: ENV.fetch('APP_HOST', 'tchopmygrinds.onrender.com')
  }
end
```

## Configuration Géolocalisation

### Variables API Géocodage

```bash
# API Key pour service de géocodage (optionnel)
GEOCODER_API_KEY=your_geocoding_api_key

# Configuration des limites
MAX_SEARCH_RADIUS=100  # km maximum pour les recherches
DEFAULT_SEARCH_RADIUS=50  # km par défaut

# Timeout pour les requêtes de géocodage
GEOCODER_TIMEOUT=5  # secondes
```

### Configuration Geocoder

```ruby
# config/initializers/geocoder.rb
Geocoder.configure(
  # API provider (Nominatim par défaut, gratuit)
  lookup: :nominatim,
  
  # API key si nécessaire
  api_key: ENV['GEOCODER_API_KEY'],
  
  # Timeout
  timeout: ENV.fetch('GEOCODER_TIMEOUT', 5).to_i,
  
  # Cache des résultats
  cache: Rails.cache,
  cache_ttl: 1.hour,
  
  # Limites de taux
  always_raise: :all,
  
  # Configuration spécifique Nominatim
  nominatim: {
    email: ENV.fetch('ADMIN_EMAIL', 'admin@tchopmygrinds.com'),
    use_https: true
  }
)
```

## Configuration de Performance

### Variables Cache et Session

```bash
# Configuration Redis (si utilisé)
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_DB=1

# Configuration session
SESSION_KEY_BASE=your_long_random_session_key
SESSION_TIMEOUT=1800  # 30 minutes

# Configuration cache
CACHE_STORE=memory_store  # ou redis_cache_store
CACHE_SIZE_LIMIT=67108864  # 64 MB
```

### Variables de Performance

```bash
# Rails
RAILS_MAX_THREADS=5
WEB_CONCURRENCY=1  # Nombre de workers (limité par RAM)

# Base de données
DB_POOL_SIZE=5
DB_TIMEOUT=5000  # millisecondes

# Assets
ASSETS_CDN_URL=  # URL CDN si configuré
ASSETS_PRECOMPILE_CACHE=true
```

## Variables de Sécurité

### Configuration CORS et Sécurité

```bash
# CORS (si API utilisée par d'autres domaines)
CORS_ORIGINS=https://tchopmygrinds.onrender.com,http://localhost:3000

# Sécurité
SECRET_KEY_BASE=your_very_long_secret_key_base_here
DEVISE_SECRET_KEY=your_devise_secret_key

# Force HTTPS
FORCE_SSL=true

# Content Security Policy
CSP_ENABLED=true
```

### Configuration dans Rails

```ruby
# config/environments/production.rb
Rails.application.configure do
  # Clé secrète depuis ENV ou credentials
  config.secret_key_base = ENV['SECRET_KEY_BASE'] || 
                          Rails.application.credentials.secret_key_base
  
  # Force SSL
  config.force_ssl = ENV['FORCE_SSL'] == 'true'
  
  # CORS configuration
  config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins ENV['CORS_ORIGINS']&.split(',') || []
      resource '*', 
        headers: :any, 
        methods: [:get, :post, :put, :patch, :delete, :options, :head]
    end
  end if ENV['CORS_ORIGINS'].present?
end
```

## Configuration Logging

### Variables de Log

```bash
# Niveau de log
LOG_LEVEL=warn  # debug, info, warn, error, fatal

# Destination des logs
LOG_TO_STDOUT=true
RAILS_LOG_TO_STDOUT=true

# Rotation des logs (développement)
LOG_ROTATION_SIZE=10485760  # 10MB
LOG_ROTATION_COUNT=5
```

### Configuration Rails

```ruby
# config/environments/production.rb
Rails.application.configure do
  # Niveau de log depuis ENV
  config.log_level = ENV.fetch('LOG_LEVEL', 'warn').to_sym
  
  # Destination
  if ENV['RAILS_LOG_TO_STDOUT'].present?
    logger = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end
  
  # Filtrage des paramètres sensibles
  config.filter_parameters += [
    :password, :password_confirmation, :email, 
    :api_key, :secret, :token
  ]
end
```

## Configuration par Environnement

### Développement (.env.development)

```bash
# Base de données locale
DATABASE_URL=postgresql://localhost/tchopmygrinds_development

# Email - Prévisualisation en local
DELIVERY_METHOD=letter_opener_web

# Géolocalisation - Mode développement
GEOCODER_LOOKUP=test  # Utilise des données fictives
DEFAULT_SEARCH_RADIUS=25

# Performance - Pas de cache
CACHE_STORE=null_store
ASSETS_DEBUG=true

# Debugging
LOG_LEVEL=debug
RAISE_DELIVERY_ERRORS=true
```

### Test (.env.test)

```bash
# Base de données de test
DATABASE_URL=postgresql://localhost/tchopmygrinds_test

# Email - Désactivé pour les tests
DELIVERY_METHOD=test

# Géolocalisation - Données mockées
GEOCODER_LOOKUP=test
GEOCODER_DEFAULT_CITY="Lyon, France"

# Performance - Optimisé pour vitesse
CACHE_STORE=null_store
ASSETS_COMPILE=false

# Logging minimal
LOG_LEVEL=fatal
QUIET_ASSETS=true
```

### Production (.env.production)

```bash
# Variables critiques (définies dans Render dashboard)
RAILS_MASTER_KEY=xxx
DATABASE_URL=postgresql://xxx

# Email production
SENDGRID_API_KEY=xxx
DELIVERY_METHOD=sendgrid_actionmailer
APP_HOST=tchopmygrinds.onrender.com

# Performance optimisée
CACHE_STORE=memory_store
WEB_CONCURRENCY=1
RAILS_MAX_THREADS=5

# Sécurité
FORCE_SSL=true
LOG_LEVEL=warn

# Limites applicatives
MAX_SEARCH_RADIUS=100
DEFAULT_SEARCH_RADIUS=50
```

## Gestion des Secrets avec Figaro

### Configuration Locale (config/application.yml)

```yaml
# config/application.yml - JAMAIS commité
development:
  database_url: postgresql://localhost/tchopmygrinds_development
  sendgrid_api_key: test_key
  geocoder_timeout: 10

test:
  database_url: postgresql://localhost/tchopmygrinds_test
  delivery_method: test

production:
  # Variables définies dans l'environnement Render
  # Ce fichier n'est pas utilisé en production
```

### Utilisation dans le Code

```ruby
# Accès aux variables avec fallback
class ApplicationController < ActionController::Base
  private
  
  def max_search_radius
    ENV.fetch('MAX_SEARCH_RADIUS', 50).to_i
  end
  
  def app_host
    ENV.fetch('APP_HOST', request.host)
  end
end
```

## Validation des Variables

### Script de Vérification

```ruby
# lib/tasks/config_check.rake
namespace :config do
  desc "Vérifier les variables d'environnement requises"
  task :check => :environment do
    required_vars = %w[
      RAILS_MASTER_KEY
      DATABASE_URL
      SECRET_KEY_BASE
    ]
    
    missing_vars = required_vars.select { |var| ENV[var].blank? }
    
    if missing_vars.any?
      puts "❌ Variables manquantes: #{missing_vars.join(', ')}"
      exit 1
    else
      puts "✅ Configuration valide"
    end
  end
end
```

### Initializer de Validation

```ruby
# config/initializers/environment_validation.rb
if Rails.env.production?
  required_env_vars = %w[
    RAILS_MASTER_KEY
    DATABASE_URL
    SECRET_KEY_BASE
  ]
  
  missing_vars = required_env_vars.select { |var| ENV[var].blank? }
  
  if missing_vars.any?
    raise "Variables d'environnement manquantes: #{missing_vars.join(', ')}"
  end
end
```

Cette configuration flexible permet à l'application de s'adapter automatiquement selon l'environnement tout en maintenant la sécurité des données sensibles.
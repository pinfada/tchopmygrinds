# Configuration CORS pour TchopMyGrinds React + Rails API
# JWT Authentication - pas de cookies donc credentials: false

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Origins autorisés pour le développement
    origins 'http://localhost:3001', 'http://127.0.0.1:3001', 'localhost:3001'
    
    # Endpoints API publics (consultation sans auth)
    resource '/api/v1/commerces*',
      headers: :any,
      methods: [:get, :options, :head],
      credentials: false, # JWT ne nécessite pas de cookies
      max_age: 86400
      
    resource '/api/v1/products*',
      headers: :any,
      methods: [:get, :options, :head],
      credentials: false,
      max_age: 86400
    
    # Endpoints API authentifiés
    resource '/api/v1/auth*',
      headers: ['Authorization', 'Content-Type', 'Accept', 'Origin'],
      methods: [:get, :post, :patch, :delete, :options, :head],
      credentials: false,
      expose: ['Authorization'], # Important pour récupérer le JWT token
      max_age: 86400
      
    # Autres endpoints API nécessitant auth
    resource '/api/v1/*',
      headers: ['Authorization', 'Content-Type', 'Accept', 'Origin'],
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false,
      expose: ['Authorization'],
      max_age: 86400
  end
  
  # Configuration production
  if Rails.env.production?
    allow do
      origins ENV['FRONTEND_URL'] || 'https://tchopmygrinds.onrender.com'
      
      resource '/api/v1/*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: false,
        expose: ['Authorization'],
        max_age: 86400
    end
  end
  
  # Fallback pour tous les OPTIONS (préflight)
  allow do
    origins '*'
    resource '*',
      headers: :any,
      methods: [:options],
      credentials: false,
      max_age: 1728000
  end
end

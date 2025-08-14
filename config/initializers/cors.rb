# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# Configuration CORS pour l'API React
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # En développement: autoriser React (port 3001)
    origins 'http://localhost:3001', 'http://127.0.0.1:3001'
    
    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
  
  # En production: autoriser le domaine principal
  if Rails.env.production?
    allow do
      origins ENV['FRONTEND_URL'] || 'https://tchopmygrinds.onrender.com'
      
      resource '/api/*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true,
        expose: ['Authorization']
    end
  end
end

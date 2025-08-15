# frozen_string_literal: true

# Configuration Devise JWT pour TchopMyGrinds
Devise.setup do |config|
  # Configuration JWT avec devise-jwt
  config.jwt do |jwt|
    # Clé secrète pour signer les tokens JWT
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY'] || Rails.application.secret_key_base
    
    # Durée d'expiration des tokens (24 heures)
    jwt.expiration_time = 24.hours.to_i
    
    # Algorithme de chiffrement
    jwt.algorithm = 'HS256'
    
    # Routes où le JWT est requis (API seulement)
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/login$}],
      ['POST', %r{^/api/v1/auth/register$}]
    ]
    
    # Routes où le JWT est révoqué (logout)
    jwt.revocation_requests = [
      ['POST', %r{^/api/v1/auth/logout$}]
    ]
    
    # Où chercher le token JWT dans la requête
    jwt.aud_header = 'JWT'
  end
end

# JWT Authentication configuré avec devise-jwt
# CORS configuration déjà présente dans config/application.rb
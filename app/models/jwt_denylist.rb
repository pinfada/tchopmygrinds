# frozen_string_literal: true

# Modèle pour gérer la révocation des tokens JWT (denylist/blacklist)
# Utilisé par devise-jwt pour invalider les tokens lors du logout
class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist

  # Table pour stocker les tokens révoqués
  self.table_name = 'jwt_denylists'
end
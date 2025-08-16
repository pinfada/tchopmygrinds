# Configuration de l'encodage pour éviter les erreurs UTF-8 en production
# Particulièrement important pour Render.com et autres services cloud

# Forcer l'encodage UTF-8 par défaut
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Configuration spécifique pour l'environnement
if Rails.env.production?
  # Forcer les variables d'environnement
  ENV['LANG'] ||= 'en_US.UTF-8'
  ENV['LC_ALL'] ||= 'en_US.UTF-8'
  
  # Configurer le logger pour éviter les erreurs d'encodage
  Rails.logger.level = :info if Rails.logger
end

# Patch pour ActionView pour gérer les erreurs d'encodage
if defined?(ActionView)
  module ActionView::Helpers::TextHelper
    def truncate_with_encoding_safety(text, options = {})
      return nil if text.nil?
      
      # Forcer l'encodage UTF-8 et nettoyer
      safe_text = text.to_s.force_encoding('UTF-8').scrub('?')
      truncate_without_encoding_safety(safe_text, options)
    end
    
    # Garder une référence à la méthode originale
    alias_method :truncate_without_encoding_safety, :truncate
    alias_method :truncate, :truncate_with_encoding_safety
  end
end
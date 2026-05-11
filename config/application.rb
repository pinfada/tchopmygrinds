require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
# require "action_cable/engine"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module StatExo1
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1
    
    # Mise à jour du format de cache pour Rails 7.1
    config.active_support.cache_format_version = 7.1

    # Configuration de l'encodage pour éviter les erreurs UTF-8
    config.encoding = "utf-8"
    
    # Configuration spécifique pour les environnements cloud (Render, Heroku, etc.)
    if Rails.env.production?
      # Forcer l'encodage UTF-8 pour tous les strings
      config.before_configuration do
        Encoding.default_external = Encoding::UTF_8
        Encoding.default_internal = Encoding::UTF_8
      end
    end

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w(assets tasks))

    # Rate-limit hot endpoints (login, register, product_interests).
    # The initializer is auto-loaded; we only need to mount the middleware.
    config.middleware.use Rack::Attack

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end

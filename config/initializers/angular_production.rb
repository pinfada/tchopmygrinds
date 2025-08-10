# AngularJS production optimizations
if Rails.env.production?
  Rails.application.config.after_initialize do
    # Configure asset compression and caching for AngularJS
    Rails.application.config.assets.configure do |env|
      # Add AngularJS-specific file extensions
      env.register_mime_type 'application/javascript', extensions: ['.js.erb']
      
      # Enable Gzip compression for better performance
      env.register_compressor 'application/javascript', :gzip, proc { |input|
        require 'zlib'
        Zlib::Deflate.deflate(input, Zlib::BEST_COMPRESSION)
      }
      
      # Configure caching headers
      env.context_class.class_eval do
        def cache_key
          @cache_key ||= "#{super}_angular_#{Rails.application.config.assets.version}"
        end
      end
    end
  end
end
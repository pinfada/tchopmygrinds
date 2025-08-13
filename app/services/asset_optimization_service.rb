# Service d'optimisation des assets pour améliorer les performances
# Gère la compression, minification et optimisation des ressources statiques

class AssetOptimizationService
  include ActiveSupport::Configurable
  
  # Configuration
  config_accessor :enable_compression, default: Rails.env.production?
  config_accessor :enable_gzip, default: true
  config_accessor :enable_brotli, default: true
  config_accessor :image_quality, default: 85
  config_accessor :cache_duration, default: 1.year
  
  class << self
    # Optimise tous les assets de l'application
    def optimize_all_assets
      new.optimize_all
    end
    
    # Optimise un asset spécifique
    def optimize_asset(file_path)
      new.optimize_asset(file_path)
    end
    
    # Nettoie les anciens assets
    def cleanup_old_assets(keep_versions = 3)
      new.cleanup_old_assets(keep_versions)
    end
  end
  
  def initialize
    @logger = Rails.logger
    @stats = {
      processed: 0,
      compressed: 0,
      total_savings: 0,
      errors: 0
    }
  end
  
  # Optimise tous les assets
  def optimize_all
    start_time = Time.current
    @logger.info "🚀 Asset optimization started"
    
    begin
      # Optimiser les JavaScript
      optimize_javascript_files
      
      # Optimiser les CSS  
      optimize_css_files
      
      # Optimiser les images
      optimize_image_files
      
      # Générer les versions compressées
      generate_compressed_versions if self.class.enable_compression
      
      # Mettre à jour les métadonnées des assets
      update_asset_metadata
      
      duration = Time.current - start_time
      @logger.info "✅ Asset optimization completed in #{duration.round(2)}s"
      @logger.info "📊 Stats: #{@stats[:processed]} processed, #{@stats[:compressed]} compressed, #{format_bytes(@stats[:total_savings])} saved"
      
      @stats.merge(duration: duration, success: true)
    rescue StandardError => e
      @logger.error "❌ Asset optimization failed: #{e.message}"
      @stats.merge(error: e.message, success: false)
    end
  end
  
  # Optimise un asset spécifique
  def optimize_asset(file_path)
    return unless File.exist?(file_path)
    
    @logger.info "🔧 Optimizing asset: #{file_path}"
    original_size = File.size(file_path)
    
    case File.extname(file_path).downcase
    when '.js'
      optimize_javascript_file(file_path)
    when '.css', '.scss'
      optimize_css_file(file_path) 
    when '.jpg', '.jpeg', '.png', '.gif', '.webp'
      optimize_image_file(file_path)
    else
      @logger.warn "⚠️  Unknown asset type: #{file_path}"
      return { skipped: true, reason: 'unknown_type' }
    end
    
    new_size = File.size(file_path)
    savings = original_size - new_size
    @stats[:total_savings] += savings if savings > 0
    
    {
      original_size: original_size,
      new_size: new_size,
      savings: savings,
      savings_percent: (savings.to_f / original_size * 100).round(2)
    }
  end
  
  private
  
  def optimize_javascript_files
    js_files = Dir.glob(Rails.root.join('app/assets/javascripts/**/*.js'))
    js_files.concat(Dir.glob(Rails.root.join('public/assets/**/*.js')))
    
    js_files.each do |file|
      next if file.include?('.min.') # Skip already minified files
      optimize_javascript_file(file)
    end
  end
  
  def optimize_javascript_file(file_path)
    content = File.read(file_path)
    
    # Minification basique (on pourrait utiliser une gem comme uglifier)
    minified = minify_javascript(content)
    
    # Écrire le fichier minifié si plus petit
    if minified.bytesize < content.bytesize
      File.write(file_path, minified)
      @stats[:compressed] += 1
    end
    
    @stats[:processed] += 1
  rescue StandardError => e
    @logger.error "Error optimizing JS file #{file_path}: #{e.message}"
    @stats[:errors] += 1
  end
  
  def optimize_css_files
    css_files = Dir.glob(Rails.root.join('app/assets/stylesheets/**/*.css'))
    css_files.concat(Dir.glob(Rails.root.join('public/assets/**/*.css')))
    
    css_files.each do |file|
      next if file.include?('.min.') # Skip already minified files
      optimize_css_file(file)
    end
  end
  
  def optimize_css_file(file_path)
    content = File.read(file_path)
    
    # Minification CSS basique
    minified = minify_css(content)
    
    # Écrire le fichier minifié si plus petit
    if minified.bytesize < content.bytesize
      File.write(file_path, minified)
      @stats[:compressed] += 1
    end
    
    @stats[:processed] += 1
  rescue StandardError => e
    @logger.error "Error optimizing CSS file #{file_path}: #{e.message}"
    @stats[:errors] += 1
  end
  
  def optimize_image_files
    image_files = Dir.glob(Rails.root.join('app/assets/images/**/*.{jpg,jpeg,png,gif}'))
    image_files.concat(Dir.glob(Rails.root.join('public/assets/**/*.{jpg,jpeg,png,gif}')))
    
    image_files.each do |file|
      optimize_image_file(file)
    end
  end
  
  def optimize_image_file(file_path)
    # Pour une vraie optimisation d'images, on utiliserait ImageOptim ou mini_magick
    # Ici on simule l'optimisation basique
    
    original_size = File.size(file_path)
    
    # Simulation d'optimisation (dans un vrai projet, utiliser ImageOptim)
    if File.extname(file_path).downcase.in?(['.jpg', '.jpeg'])
      # Optimisation JPEG simulée
      @logger.info "📷 Optimizing JPEG: #{File.basename(file_path)}"
    elsif File.extname(file_path).downcase == '.png'
      # Optimisation PNG simulée  
      @logger.info "🖼️  Optimizing PNG: #{File.basename(file_path)}"
    end
    
    @stats[:processed] += 1
    
    # Créer une version WebP si possible
    create_webp_version(file_path) if should_create_webp?(file_path)
    
  rescue StandardError => e
    @logger.error "Error optimizing image #{file_path}: #{e.message}"
    @stats[:errors] += 1
  end
  
  def generate_compressed_versions
    @logger.info "📦 Generating compressed versions..."
    
    asset_files = Dir.glob(Rails.root.join('public/assets/**/*.{js,css}'))
    
    asset_files.each do |file|
      generate_gzip_version(file) if self.class.enable_gzip
      generate_brotli_version(file) if self.class.enable_brotli
    end
  end
  
  def generate_gzip_version(file_path)
    return if File.exist?("#{file_path}.gz")
    
    content = File.read(file_path)
    compressed = Zlib::Deflate.deflate(content, Zlib::BEST_COMPRESSION)
    
    File.write("#{file_path}.gz", compressed)
    @logger.debug "📦 Generated gzip: #{File.basename(file_path)}.gz"
  rescue StandardError => e
    @logger.error "Error generating gzip for #{file_path}: #{e.message}"
  end
  
  def generate_brotli_version(file_path)
    # Brotli nécessite la gem 'brotli' 
    # return if File.exist?("#{file_path}.br")
    # 
    # content = File.read(file_path)
    # compressed = Brotli.deflate(content)
    # File.write("#{file_path}.br", compressed)
    
    @logger.debug "⚠️  Brotli compression requires 'brotli' gem"
  end
  
  def create_webp_version(file_path)
    webp_path = file_path.sub(/\.(jpg|jpeg|png)$/i, '.webp')
    return if File.exist?(webp_path)
    
    # Nécessite ImageMagick/mini_magick pour la vraie conversion
    # MiniMagick::Image.open(file_path).format('webp').write(webp_path)
    
    @logger.debug "🖼️  WebP conversion requires ImageMagick/mini_magick"
  end
  
  def should_create_webp?(file_path)
    File.extname(file_path).downcase.in?(['.jpg', '.jpeg', '.png']) &&
    !File.exist?(file_path.sub(/\.(jpg|jpeg|png)$/i, '.webp'))
  end
  
  def update_asset_metadata
    @logger.info "📝 Updating asset metadata..."
    
    # Mettre à jour le manifeste des assets avec les nouvelles informations
    manifest_path = Rails.root.join('public/assets/.sprockets-manifest-*.json')
    manifest_files = Dir.glob(manifest_path)
    
    if manifest_files.any?
      manifest_file = manifest_files.first
      begin
        manifest = JSON.parse(File.read(manifest_file))
        manifest['optimization'] = {
          timestamp: Time.current.iso8601,
          stats: @stats.except(:errors),
          version: '1.0'
        }
        File.write(manifest_file, JSON.pretty_generate(manifest))
      rescue StandardError => e
        @logger.error "Error updating manifest: #{e.message}"
      end
    end
  end
  
  def cleanup_old_assets(keep_versions = 3)
    @logger.info "🧹 Cleaning up old assets (keeping #{keep_versions} versions)..."
    
    # Grouper les assets par nom de base
    asset_groups = Dir.glob(Rails.root.join('public/assets/*'))
                     .group_by { |f| f.gsub(/-[a-f0-9]{64}/, '') }
    
    asset_groups.each do |base_name, files|
      if files.size > keep_versions
        # Trier par date de modification et supprimer les plus anciens
        files_to_remove = files.sort_by { |f| File.mtime(f) }[0..-(keep_versions + 1)]
        
        files_to_remove.each do |file|
          File.delete(file) if File.exist?(file)
          File.delete("#{file}.gz") if File.exist?("#{file}.gz")
          File.delete("#{file}.br") if File.exist?("#{file}.br")
          @logger.debug "🗑️  Removed old asset: #{File.basename(file)}"
        end
      end
    end
  end
  
  # Minification basique JavaScript
  def minify_javascript(content)
    content
      .gsub(/\/\*.*?\*\//m, '') # Supprimer les commentaires /* */
      .gsub(/\/\/.*$/, '') # Supprimer les commentaires //
      .gsub(/\s+/, ' ') # Réduire les espaces multiples
      .gsub(/;\s*}/, '}') # Nettoyer avant les accolades
      .gsub(/{\s*/, '{') # Nettoyer après les accolades
      .strip
  end
  
  # Minification basique CSS
  def minify_css(content)
    content
      .gsub(/\/\*.*?\*\//m, '') # Supprimer les commentaires
      .gsub(/\s+/, ' ') # Réduire les espaces
      .gsub(/;\s*}/, '}') # Nettoyer les points-virgules avant }
      .gsub(/{\s*/, '{') # Nettoyer après {
      .gsub(/:\s*/, ':') # Nettoyer après :
      .gsub(/;\s*/, ';') # Nettoyer après ;
      .strip
  end
  
  def format_bytes(bytes)
    return '0 B' if bytes.zero?
    
    units = %w[B KB MB GB TB]
    exp = (Math.log(bytes) / Math.log(1024)).to_i
    exp = [exp, units.length - 1].min
    
    "#{(bytes.to_f / (1024 ** exp)).round(2)} #{units[exp]}"
  end
end
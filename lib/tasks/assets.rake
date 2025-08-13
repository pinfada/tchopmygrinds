# Tâches Rake personnalisées pour l'optimisation des assets
namespace :assets do
  desc "Optimize all application assets (JS, CSS, images)"
  task optimize: :environment do
    puts "🚀 Starting asset optimization..."
    
    result = AssetOptimizationService.optimize_all_assets
    
    if result[:success]
      puts "✅ Asset optimization completed successfully!"
      puts "📊 Processed: #{result[:processed]} files"
      puts "📦 Compressed: #{result[:compressed]} files" 
      puts "💾 Total savings: #{format_bytes(result[:total_savings])}"
      puts "⏱️  Duration: #{result[:duration].round(2)}s"
    else
      puts "❌ Asset optimization failed: #{result[:error]}"
      exit 1
    end
  end

  desc "Optimize a specific asset file"
  task :optimize_file, [:file_path] => :environment do |t, args|
    file_path = args[:file_path]
    
    unless file_path
      puts "❌ Please provide a file path: rake assets:optimize_file[path/to/file]"
      exit 1
    end
    
    unless File.exist?(file_path)
      puts "❌ File not found: #{file_path}"
      exit 1
    end
    
    puts "🔧 Optimizing #{file_path}..."
    
    result = AssetOptimizationService.optimize_asset(file_path)
    
    if result[:skipped]
      puts "⚠️  Skipped: #{result[:reason]}"
    else
      puts "✅ Optimization completed!"
      puts "📏 Original size: #{format_bytes(result[:original_size])}"
      puts "📉 New size: #{format_bytes(result[:new_size])}"
      puts "💾 Savings: #{format_bytes(result[:savings])} (#{result[:savings_percent]}%)"
    end
  end

  desc "Clean up old asset versions"
  task :cleanup, [:keep_versions] => :environment do |t, args|
    keep_versions = (args[:keep_versions] || 3).to_i
    
    puts "🧹 Cleaning up old assets (keeping #{keep_versions} versions)..."
    
    AssetOptimizationService.cleanup_old_assets(keep_versions)
    
    puts "✅ Cleanup completed!"
  end

  desc "Generate compressed versions (gzip, brotli) of assets"
  task compress: :environment do
    puts "📦 Generating compressed versions of assets..."
    
    service = AssetOptimizationService.new
    service.send(:generate_compressed_versions)
    
    puts "✅ Compression completed!"
  end

  desc "Full asset pipeline: precompile, optimize, and compress"
  task full: :environment do
    puts "🏗️  Running full asset pipeline..."
    
    # 1. Precompiler les assets
    puts "1️⃣  Precompiling assets..."
    system("rails assets:precompile")
    
    # 2. Optimiser les assets
    puts "2️⃣  Optimizing assets..."
    Rake::Task["assets:optimize"].invoke
    
    # 3. Nettoyer les anciennes versions
    puts "3️⃣  Cleaning up old versions..."
    Rake::Task["assets:cleanup"].invoke
    
    puts "✅ Full asset pipeline completed!"
  end

  desc "Asset statistics and analysis"
  task stats: :environment do
    puts "📊 Asset Statistics"
    puts "=" * 50
    
    # Analyser les assets publics
    public_assets = Dir.glob(Rails.root.join('public/assets/**/*')).select { |f| File.file?(f) }
    
    total_size = public_assets.sum { |f| File.size(f) }
    
    # Grouper par type
    by_type = public_assets.group_by { |f| File.extname(f).downcase }
    
    puts "📁 Total assets: #{public_assets.size}"
    puts "📏 Total size: #{format_bytes(total_size)}"
    puts ""
    
    puts "📋 By file type:"
    by_type.each do |ext, files|
      type_size = files.sum { |f| File.size(f) }
      puts "  #{ext.ljust(8)}: #{files.size.to_s.rjust(4)} files, #{format_bytes(type_size)}"
    end
    
    puts ""
    
    # Analyser les fichiers compressés
    gzipped = public_assets.select { |f| f.end_with?('.gz') }
    brotli = public_assets.select { |f| f.end_with?('.br') }
    
    puts "📦 Compression status:"
    puts "  Gzipped files: #{gzipped.size}"
    puts "  Brotli files: #{brotli.size}"
    
    # Recommandations
    puts ""
    puts "💡 Recommendations:"
    
    large_files = public_assets.select { |f| File.size(f) > 1.megabyte }
    if large_files.any?
      puts "  ⚠️  Large files detected (>1MB):"
      large_files.each do |file|
        puts "    - #{File.basename(file)}: #{format_bytes(File.size(file))}"
      end
    end
    
    uncompressed = public_assets.select { |f| 
      (f.end_with?('.js') || f.end_with?('.css')) && 
      !File.exist?("#{f}.gz")
    }
    
    if uncompressed.any?
      puts "  📦 Consider compressing these files:"
      uncompressed.first(5).each do |file|
        puts "    - #{File.basename(file)}"
      end
      puts "    ... and #{uncompressed.size - 5} more" if uncompressed.size > 5
    end
  end

  private

  def format_bytes(bytes)
    return '0 B' if bytes.zero?
    
    units = %w[B KB MB GB TB]
    exp = (Math.log(bytes) / Math.log(1024)).to_i
    exp = [exp, units.length - 1].min
    
    "#{(bytes.to_f / (1024 ** exp)).round(2)} #{units[exp]}"
  end
end
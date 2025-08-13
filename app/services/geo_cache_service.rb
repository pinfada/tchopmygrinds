# Service de cache pour les requêtes géolocalisées
class GeoCacheService
  include Singleton
  
  def initialize
    @cache = Rails.cache
    @default_ttl = 15.minutes # TTL par défaut
    @logger = LoggingService.instance
  end
  
  # Cache pour les recherches de commerces par géolocalisation
  def cached_commerces_near(lat, lng, radius_km, filters = {})
    cache_key = build_cache_key('commerces_near', lat, lng, radius_km, filters)
    
    @cache.fetch(cache_key, expires_in: @default_ttl) do
      start_time = Time.current
      
      results = Commerce.includes(:user, :categorizations, :products)
                       .near([lat, lng], radius_km, units: :km)
      
      # Appliquer les filtres additionnels
      results = apply_filters(results, filters) if filters.any?
      
      # Sérialiser les résultats pour le cache
      serialized_results = results.map do |commerce|
        {
          id: commerce.id,
          nom: commerce.nom,
          adresse1: commerce.adresse1,
          ville: commerce.ville,
          latitude: commerce.latitude,
          longitude: commerce.longitude,
          distance: commerce.distance_to([lat, lng]).round(2),
          products_count: commerce.products.where('unitsinstock > 0').count,
          user_type: commerce.user&.statut_type,
          categories: commerce.categorizations.pluck(:name),
          cached_at: Time.current.iso8601
        }
      end
      
      duration_ms = ((Time.current - start_time) * 1000).round(2)
      
      @logger.log_geolocation_performance(
        'commerces_search', lat, lng, radius_km, serialized_results.length, duration_ms
      )
      
      {
        results: serialized_results,
        total_count: serialized_results.length,
        search_params: { lat: lat, lng: lng, radius: radius_km, filters: filters },
        cached_at: Time.current.iso8601,
        ttl: @default_ttl
      }
    end
  end
  
  # Cache pour les recherches de produits par géolocalisation
  def cached_products_near(product_name, lat, lng, radius_km, options = {})
    cache_key = build_cache_key('products_near', lat, lng, radius_km, { 
      product: product_name.downcase.strip,
      options: options 
    })
    
    @cache.fetch(cache_key, expires_in: @default_ttl) do
      start_time = Time.current
      
      # Recherche flexible du produit
      products = Product.where("LOWER(nom) LIKE LOWER(?)", "%#{product_name.strip}%")
                       .where("unitsinstock > 0")
      
      results = []
      
      products.each do |product|
        product.commerces
               .includes(:user, :categorizations)
               .near([lat, lng], radius_km, units: :km)
               .each do |commerce|
          
          categorization = commerce.categorizations.find_by(product: product)
          next unless categorization
          
          results << {
            commerce_id: commerce.id,
            commerce_name: commerce.nom,
            ville: commerce.ville,
            latitude: commerce.latitude,
            longitude: commerce.longitude,
            distance: commerce.distance_to([lat, lng]).round(2),
            commerce_type: commerce.user&.statut_type || 'sedentary',
            product_id: product.id,
            product_name: product.nom,
            prix: product.unitprice,
            stock: product.unitsinstock,
            search_query: product_name,
            cached_at: Time.current.iso8601
          }
        end
      end
      
      # Trier par distance
      results.sort_by! { |r| r[:distance] }
      
      duration_ms = ((Time.current - start_time) * 1000).round(2)
      
      @logger.log_geolocation_performance(
        'products_search', lat, lng, radius_km, results.length, duration_ms
      )
      
      {
        results: results,
        total_count: results.length,
        search_params: { 
          product: product_name, 
          lat: lat, 
          lng: lng, 
          radius: radius_km, 
          options: options 
        },
        cached_at: Time.current.iso8601,
        ttl: @default_ttl
      }
    end
  end
  
  # Invalidation du cache pour une zone géographique
  def invalidate_geo_cache(lat, lng, radius_km = 10)
    # Rechercher toutes les clés de cache dans la zone
    pattern = "geo_cache:*:lat_#{lat.round(2)}*:lng_#{lng.round(2)}*"
    
    keys = @cache.instance_variable_get(:@data)&.keys&.select { |key| key.match(/#{pattern}/) } || []
    
    keys.each { |key| @cache.delete(key) }
    
    @logger.log_business_event('GEO_CACHE_INVALIDATED', {
      center: { lat: lat, lng: lng },
      radius_km: radius_km,
      invalidated_keys_count: keys.length
    })
    
    keys.length
  end
  
  # Invalidation sélective par type de ressource
  def invalidate_resource_cache(resource_type, resource_id = nil)
    pattern = if resource_id
      "geo_cache:#{resource_type}*:*#{resource_id}*"
    else
      "geo_cache:#{resource_type}*"
    end
    
    keys = @cache.instance_variable_get(:@data)&.keys&.select { |key| key.match(/#{pattern}/) } || []
    keys.each { |key| @cache.delete(key) }
    
    @logger.log_business_event('RESOURCE_CACHE_INVALIDATED', {
      resource_type: resource_type,
      resource_id: resource_id,
      invalidated_keys_count: keys.length
    })
    
    keys.length
  end
  
  # Statistiques du cache
  def cache_stats
    # Estimer le nombre de clés géo dans le cache
    geo_keys = @cache.instance_variable_get(:@data)&.keys&.select { |key| key.start_with?('geo_cache:') } || []
    
    {
      total_geo_keys: geo_keys.length,
      default_ttl: @default_ttl,
      cache_backend: @cache.class.name,
      timestamp: Time.current.iso8601
    }
  end
  
  private
  
  def build_cache_key(operation, lat, lng, radius, additional_params = {})
    # Arrondir les coordonnées pour améliorer les hits de cache
    rounded_lat = lat.round(3)  # Précision ~100m
    rounded_lng = lng.round(3)
    
    base_key = "geo_cache:#{operation}:lat_#{rounded_lat}:lng_#{rounded_lng}:r_#{radius}"
    
    if additional_params.any?
      params_hash = Digest::MD5.hexdigest(additional_params.to_json)
      "#{base_key}:#{params_hash}"
    else
      base_key
    end
  end
  
  def apply_filters(query, filters)
    filtered_query = query
    
    # Filtre par type de commerce
    if filters[:commerce_type].present?
      filtered_query = filtered_query.joins(:user)
                                  .where(users: { statut_type: filters[:commerce_type] })
    end
    
    # Filtre par catégories
    if filters[:categories].present?
      category_names = Array(filters[:categories])
      filtered_query = filtered_query.joins(:categorizations)
                                  .where(categorizations: { name: category_names })
    end
    
    # Filtre par disponibilité de produits
    if filters[:has_products]
      filtered_query = filtered_query.joins(:products)
                                  .where(products: { unitsinstock: 1.. })
                                  .distinct
    end
    
    filtered_query
  end
end
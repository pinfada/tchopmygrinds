# Service de pagination avec curseur pour des performances optimales
# Utilise des curseurs au lieu d'OFFSET pour éviter les problèmes de performance
# sur de grandes collections de données

class CursorPaginationService
  include ActiveSupport::Configurable
  
  # Configuration par défaut
  config_accessor :default_page_size, default: 20
  config_accessor :max_page_size, default: 100
  config_accessor :cursor_field, default: :id
  
  def initialize(relation, options = {})
    @relation = relation
    @page_size = [options[:page_size]&.to_i || self.class.default_page_size, 
                  self.class.max_page_size].min
    @cursor_field = options[:cursor_field] || self.class.cursor_field
    @direction = options[:direction]&.to_sym || :desc
    @after_cursor = options[:after]
    @before_cursor = options[:before]
    
    validate_options!
  end
  
  # Pagine la relation et retourne les résultats avec métadonnées
  def paginate
    start_time = Time.current
    
    # Construire la requête avec curseur
    query = build_cursor_query
    
    # Récupérer les items avec un élément supplémentaire pour détecter s'il y a une page suivante
    items = query.limit(@page_size + 1).to_a
    has_more = items.size > @page_size
    
    # Retirer l'élément supplémentaire s'il existe
    items = items.first(@page_size) if has_more
    
    # Générer les curseurs pour la navigation
    cursors = generate_cursors(items)
    
    duration_ms = ((Time.current - start_time) * 1000).round(2)
    
    {
      data: items,
      pagination: {
        has_previous_page: @after_cursor.present?,
        has_next_page: has_more,
        start_cursor: cursors[:start],
        end_cursor: cursors[:end],
        total_fetched: items.size,
        page_size: @page_size,
        cursor_field: @cursor_field,
        direction: @direction
      },
      meta: {
        query_duration_ms: duration_ms,
        timestamp: start_time.iso8601,
        cursor_based: true
      }
    }
  end
  
  # Méthode utilitaire pour paginer avec des filtres géospatiaux
  def self.paginate_geospatial(relation, lat:, lng:, radius:, **options)
    # Appliquer d'abord les filtres géospatiaux
    geo_relation = relation.near([lat, lng], radius, units: :km)
    
    # Utiliser la distance comme champ de curseur pour une pagination cohérente
    paginator = new(geo_relation, cursor_field: :distance, **options)
    result = paginator.paginate
    
    # Ajouter les informations géospatiales aux métadonnées
    result[:meta][:geospatial] = {
      center_lat: lat,
      center_lng: lng,
      radius_km: radius,
      ordered_by_distance: true
    }
    
    result
  end
  
  # Méthode de classe pour une utilisation simple
  def self.paginate(relation, **options)
    new(relation, options).paginate
  end
  
  # Pagination avec recherche textuelle optimisée
  def self.paginate_search(relation, query:, search_fields: [], **options)
    return paginate(relation, **options) if query.blank?
    
    # Construire la requête de recherche
    search_conditions = search_fields.map do |field|
      "LOWER(#{field}) LIKE LOWER(?)"
    end.join(' OR ')
    
    search_params = Array.new(search_fields.size) { "%#{query}%" }
    search_relation = relation.where(search_conditions, *search_params)
    
    result = paginate(search_relation, **options)
    result[:meta][:search] = {
      query: query,
      search_fields: search_fields,
      search_applied: true
    }
    
    result
  end
  
  private
  
  def validate_options!
    raise ArgumentError, "Relation must respond to :limit and :order" unless 
      @relation.respond_to?(:limit) && @relation.respond_to?(:order)
    
    raise ArgumentError, "Invalid direction: #{@direction}" unless 
      [:asc, :desc].include?(@direction)
    
    raise ArgumentError, "Page size must be positive" if @page_size <= 0
    
    # Vérifier que le champ de curseur existe si c'est un symbole
    if @cursor_field.is_a?(Symbol) && @relation.respond_to?(:column_names)
      unless @relation.column_names.include?(@cursor_field.to_s)
        Rails.logger.warn "Cursor field #{@cursor_field} not found in relation columns"
      end
    end
  end
  
  def build_cursor_query
    query = @relation.order("#{@cursor_field} #{@direction}")
    
    # Appliquer le curseur "after" (pour pagination suivante)
    if @after_cursor
      operator = @direction == :desc ? '<' : '>'
      decoded_cursor = decode_cursor(@after_cursor)
      query = query.where("#{@cursor_field} #{operator} ?", decoded_cursor[:value])
    end
    
    # Appliquer le curseur "before" (pour pagination précédente)
    if @before_cursor
      operator = @direction == :desc ? '>' : '<'
      decoded_cursor = decode_cursor(@before_cursor)
      query = query.where("#{@cursor_field} #{operator} ?", decoded_cursor[:value])
    end
    
    query
  end
  
  def generate_cursors(items)
    return { start: nil, end: nil } if items.empty?
    
    {
      start: encode_cursor(items.first),
      end: encode_cursor(items.last)
    }
  end
  
  def encode_cursor(item)
    cursor_value = item.public_send(@cursor_field)
    
    # Encoder le curseur avec des informations supplémentaires
    cursor_data = {
      value: cursor_value,
      field: @cursor_field,
      timestamp: Time.current.to_i
    }
    
    # Utiliser Base64 pour encoder le curseur de manière sécurisée
    Base64.strict_encode64(cursor_data.to_json)
  end
  
  def decode_cursor(cursor)
    return nil if cursor.blank?
    
    begin
      decoded_data = JSON.parse(Base64.strict_decode64(cursor))
      
      # Vérifier que le curseur utilise le même champ
      if decoded_data['field'].to_sym != @cursor_field
        Rails.logger.warn "Cursor field mismatch: expected #{@cursor_field}, got #{decoded_data['field']}"
        return nil
      end
      
      {
        value: decoded_data['value'],
        field: decoded_data['field'].to_sym,
        timestamp: decoded_data['timestamp']
      }
    rescue JSON::ParserError, ArgumentError => e
      Rails.logger.error "Failed to decode cursor: #{e.message}"
      nil
    end
  end
end
class Api::V1::BaseController < ApplicationController
  # Configuration pour API REST moderne
  protect_from_forgery with: :null_session
  respond_to :json

  # Hard limits on geo proximity queries. Without these, a single unauthenticated
  # caller can force a full-table Haversine scan with an unbounded radius.
  GEO_DEFAULT_RADIUS_KM = 50
  GEO_MAX_RADIUS_KM = 100

  before_action :authenticate_user_from_token!
  before_action :set_response_headers

  # CORS preflight handler. CORS headers themselves are written by rack-cors;
  # this action only needs to return a 200 with an empty body so the preflight
  # request resolves. Manually emitting `Access-Control-Allow-Origin: *` would
  # override the per-origin policy configured in config/initializers/cors.rb.
  def cors_preflight_check
    head :ok if request.method == 'OPTIONS'
  end
  
  private
  
  # JWT auth. devise-jwt populates current_user when a valid Bearer token is
  # present; if absent, we MUST render JSON 401 here rather than letting Devise's
  # FailureApp redirect to /users/sign_in (which it does when the request's
  # Accept header is `*/*` — the default for browser XHR/fetch). That HTML 302
  # is what surfaces as a CORS error in the frontend console.
  def authenticate_user_from_token!
    return unless jwt_required_for_action?
    return if current_user
    render_unauthorized
  rescue JWT::DecodeError, JWT::ExpiredSignature
    render_unauthorized
  end
  
  # Vérifier si JWT est requis pour cette action
  def jwt_required_for_action?
    # Permettre accès public à certains endpoints
    public_endpoints = %w[cors_preflight_check]
    !public_endpoints.include?(action_name)
  end
  
  # Default response headers for every authenticated API call.
  # Cache-Control is private/no-store: API responses include user-scoped data
  # (orders, profile, messages) and must never be cached by shared proxies/CDNs.
  # Public, cacheable list endpoints should override these headers locally.
  def set_response_headers
    response.headers['Cache-Control'] = 'private, no-store'
    response.headers['Pragma'] = 'no-cache'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
  end
  
  # Gestion erreurs standardisée
  def render_error(message, status = :unprocessable_entity)
    render json: {
      error: true,
      message: message,
      timestamp: Time.current.iso8601
    }, status: status
  end
  
  def render_unauthorized
    render json: {
      error: true,
      message: 'Token d\'authentification requis ou invalide',
      code: 'UNAUTHORIZED'
    }, status: :unauthorized
  end
  
  def render_not_found(resource = 'Resource')
    render json: {
      error: true,
      message: "#{resource} non trouvé",
      code: 'NOT_FOUND'
    }, status: :not_found
  end
  
  # Pagination standardisée
  def paginate_collection(collection, per_page: 20)
    page = params[:page]&.to_i || 1
    per_page = [params[:per_page]&.to_i || per_page, 100].min # Max 100
    
    paginated = collection.page(page).per(per_page)
    
    {
      data: paginated,
      meta: {
        current_page: paginated.current_page,
        total_pages: paginated.total_pages,
        total_count: paginated.total_count,
        per_page: paginated.limit_value,
        has_next: !paginated.last_page?,
        has_prev: !paginated.first_page?
      }
    }
  end
  
  # Geo filter. Returns the collection untouched if coordinates are missing or
  # invalid. The radius is always clamped to GEO_MAX_RADIUS_KM regardless of
  # what the caller asks for, to prevent full-table distance scans.
  #
  # `.near` only exists on Geocoder-enabled models (Commerce). For Product we
  # filter through its commerce association, so the caller doesn't have to
  # know the model layout. If the collection's model has neither `.near` nor a
  # commerce association, the filter is a no-op (matches the pre-fix behavior
  # for unsupported types).
  def apply_location_filter(collection, lat_param: :latitude, lng_param: :longitude, radius_param: :radius)
    coords = parse_optional_coordinates(lat_param: lat_param, lng_param: lng_param, radius_param: radius_param)
    return collection unless coords

    lat, lng, radius = coords
    klass = collection.klass

    if klass.respond_to?(:near)
      collection.near([lat, lng], radius)
    elsif klass.reflect_on_association(:commerces_through_categorizations)
      collection.joins(:commerces_through_categorizations)
                .merge(Commerce.near([lat, lng], radius))
                .distinct
    elsif klass.reflect_on_association(:commerce)
      collection.joins(:commerce).merge(Commerce.near([lat, lng], radius))
    else
      collection
    end
  end

  # Tokenized case-insensitive search across one or more columns.
  #
  # Splits `query` on whitespace and requires every token to match at least
  # one of the listed columns (AND of ORs). So "banane plantain" matches
  # "Bananes plantain mûres" even though the substring "banane plantain"
  # never appears literally.
  #
  # Stays portable: uses `LOWER(col) LIKE LOWER(?)` rather than Postgres-only
  # ILIKE, so SQLite (dev) and Postgres (prod) behave the same.
  def tokenized_search(scope, query, columns)
    tokens = query.to_s.downcase.split(/\s+/).reject(&:blank?)
    return scope if tokens.empty?

    table = scope.table_name
    tokens.each do |token|
      like = "%#{token}%"
      clause = columns.map { |c| "LOWER(#{table}.#{c}) LIKE ?" }.join(" OR ")
      scope = scope.where(clause, *Array.new(columns.length, like))
    end
    scope
  end

  # Strict coordinate parser for endpoints where geo is mandatory.
  # Renders 422 and returns nil on missing/invalid input. Callers should
  # `return unless coords = parse_required_coordinates`.
  def parse_required_coordinates(lat_param: :latitude, lng_param: :longitude, radius_param: :radius)
    if params[lat_param].blank? || params[lng_param].blank?
      render_error('Latitude et longitude requises')
      return nil
    end
    parse_coordinates(lat_param, lng_param, radius_param, render_errors: true)
  end

  # Lenient coordinate parser for endpoints where geo filtering is optional.
  # Returns nil silently if the params are absent or malformed; the endpoint
  # then falls back to a non-geo response. Callers needing a 422 on bad input
  # must use parse_required_coordinates.
  def parse_optional_coordinates(lat_param: :latitude, lng_param: :longitude, radius_param: :radius)
    return nil if params[lat_param].blank? || params[lng_param].blank?

    parse_coordinates(lat_param, lng_param, radius_param, render_errors: false)
  end

  def parse_coordinates(lat_param, lng_param, radius_param, render_errors:)
    lat = Float(params[lat_param]) rescue nil
    lng = Float(params[lng_param]) rescue nil

    if lat.nil? || lng.nil? || lat.abs > 90 || lng.abs > 180
      render_error('Coordonnées invalides : latitude doit être dans [-90, 90], longitude dans [-180, 180]') if render_errors
      return nil
    end

    raw_radius = params[radius_param]
    radius = raw_radius.present? ? (Float(raw_radius) rescue nil) : GEO_DEFAULT_RADIUS_KM
    radius = GEO_DEFAULT_RADIUS_KM if radius.nil? || radius <= 0
    radius = [radius, GEO_MAX_RADIUS_KM].min

    [lat, lng, radius]
  end
  
  # Réponse succès standardisée
  def render_success(data, message: nil, status: :ok)
    response_data = { data: data }
    response_data[:message] = message if message
    response_data[:timestamp] = Time.current.iso8601
    
    render json: response_data, status: status
  end
  
  # Logging API pour monitoring
  def log_api_request
    Rails.logger.info({
      api_version: 'v1',
      endpoint: "#{request.method} #{request.path}",
      user_id: current_user&.id,
      ip: request.remote_ip,
      user_agent: request.user_agent,
      timestamp: Time.current.iso8601
    }.to_json)
  end
  
end
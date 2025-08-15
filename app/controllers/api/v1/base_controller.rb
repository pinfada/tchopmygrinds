class Api::V1::BaseController < ApplicationController
  # Configuration pour API REST moderne
  protect_from_forgery with: :null_session
  respond_to :json
  
  before_action :authenticate_user_from_token!
  before_action :set_cache_headers
  
  # CORS preflight check (must be public)
  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, PATCH, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token, X-Requested-With'
      headers['Access-Control-Max-Age'] = '1728000'
      render json: {}, status: 200
    end
  end
  
  private
  
  # Authentification JWT avec devise-jwt
  def authenticate_user_from_token!
    # devise-jwt gère automatiquement l'authentification via Warden
    # On utilise les méthodes Devise standards
    authenticate_user! if jwt_required_for_action?
  rescue JWT::DecodeError, JWT::ExpiredSignature
    render_unauthorized
  end
  
  # Vérifier si JWT est requis pour cette action
  def jwt_required_for_action?
    # Permettre accès public à certains endpoints
    public_endpoints = %w[cors_preflight_check]
    !public_endpoints.include?(action_name)
  end
  
  # Headers pour performance et cache
  def set_cache_headers
    response.headers['Cache-Control'] = 'public, max-age=300' # 5 minutes
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
  
  # Filtrage géolocalisation
  def apply_location_filter(collection, lat_param: :latitude, lng_param: :longitude, radius_param: :radius)
    latitude = params[lat_param]&.to_f
    longitude = params[lng_param]&.to_f
    radius = params[radius_param]&.to_f || 50 # Défaut 50km
    
    if latitude && longitude
      collection.near([latitude, longitude], radius)
    else
      collection
    end
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
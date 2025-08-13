class CommercesController < ApplicationController
  include ApiResponse
  include EnhancedErrorHandling
  
  authorize_resource
  before_action :set_commerce, only: [:show, :edit, :update, :destroy]
  before_action :set_user, only: [:create, :new]
  before_action :set_pagination_params, only: [:index, :listcommerce]

  respond_to :json

  def index
    begin
      userid = params[:user_id]
      
      commerces_query = if userid.present? 
        @user = User.find(userid)
        @user.commerces
      else
        Commerce.all
      end
      
      @commerces = commerces_query
        .includes(:user, :categorizations)
        .page(@page)
        .per(@per_page)
        .order(:nom)
      
      render_paginated(@commerces)
    rescue ActiveRecord::RecordNotFound
      render_not_found("User")
    rescue StandardError => e
      Rails.logger.error "Error in commerces#index: #{e.message}"
      render_error("Internal server error")
    end
  end

  def show
    commerce_data = {
      id: @commerce.id,
      nom: @commerce.nom,
      adresse1: @commerce.adresse1,
      adresse2: @commerce.adresse2,
      ville: @commerce.ville,
      code_postal: @commerce.code_postal,
      latitude: @commerce.latitude,
      longitude: @commerce.longitude,
      user_id: @commerce.user_id,
      products_count: @commerce.products.count,
      created_at: @commerce.created_at
    }
    
    render_success(commerce_data)
  end

  def new
#   @commerce = Commerce.new
    @commerce = @user.commerces.new
    respond_with(@commerce)
  end

  def edit
    respond_with(@commerce)
  end

  def create
#   @commerce = Commerce.create(commerce_params)
    @commerce = @user.commerces.create(commerce_params)
    @commerce.save
    redirect_to root_url
#    respond_with(@commerce)
  end

  def update
    @commerce.update(commerce_params)
    respond_with(@commerce)
  end

  def destroy
    @commerce.destroy
    respond_with(@commerce)
  end

  def search
    search_name = params[:name_query]
    if search_name.present? 
#      commerces = Commerce.where('name LIKE ?',"%#{search_name}%").exists?
      recupcommerce = Commerce.where('name LIKE ?',"%#{search_name}%")
      commerces = recupcommerce.exists?
      respond_with commerces
    end
  end

  # GET /commerces/listcommerce
  # Récupération de la liste des commerces dans un rayon donné (avec cache)
  # Paramètres: lat_query, lng_query, radius (optionnel, défaut: 50km)
  def listcommerce
    with_logging do
      lat_name = params[:lat_query]&.to_f
      lng_name = params[:lng_query]&.to_f
      radius = params[:radius]&.to_i || 50
      
      if lat_name.blank? || lng_name.blank?
        return render_error("Paramètres manquants: lat_query et lng_query requis")
      end
      
      # Filtres optionnels
      filters = {
        commerce_type: params[:commerce_type],
        categories: params[:categories],
        has_products: params[:has_products].present?
      }.compact
      
      # Utiliser le cache géolocalisé
      cache_result = GeoCacheService.instance.cached_commerces_near(
        lat_name, lng_name, radius, filters
      )
      
      # Appliquer la pagination sur les résultats cachés
      total_results = cache_result[:results]
      paginated_results = Kaminari.paginate_array(total_results, total_count: total_results.length)
                                 .page(@page)
                                 .per(@per_page)
      
      log_business_event('COMMERCES_GEOLOCATED', {
        coordinates: { lat: lat_name, lng: lng_name },
        radius_km: radius,
        filters_applied: filters,
        results_count: total_results.length,
        from_cache: cache_result[:cached_at].present?
      })
      
      render_success(paginated_results, nil, :ok, {
        pagination: {
          current_page: paginated_results.current_page,
          per_page: paginated_results.limit_value,
          total_pages: paginated_results.total_pages,
          total_count: total_results.length
        },
        search_coordinates: { lat: lat_name, lng: lng_name, radius: radius },
        cache_info: {
          cached_at: cache_result[:cached_at],
          ttl: cache_result[:ttl]
        }
      })
    end
  end

  private
    def set_commerce
      @commerce = Commerce.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render_not_found("Commerce") and return
    end

    def set_user
      @user = User.find(params[:user_id])
    rescue ActiveRecord::RecordNotFound
      render_not_found("User") and return
    end
    
    def set_pagination_params
      @page = params[:page]&.to_i || 1
      @per_page = [params[:per_page]&.to_i || 20, 100].min # Max 100 items per page
    end

    def commerce_params
      params.require(:commerce).permit(:nom, :adresse1, :adresse2, :details, :code_postal, :pays, :latitude, :longitude, :ville, :user_id, product_ids: []) if params[:commerce]
    end

end

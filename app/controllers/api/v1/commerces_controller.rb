class Api::V1::CommercesController < Api::V1::BaseController
  # Skip authentication pour les endpoints publics de consultation
  skip_before_action :authenticate_user_from_token!, only: [:index, :nearby, :search, :show, :products, :location, :live]
  before_action :set_commerce, only: [:show, :update, :destroy, :products, :location, :update_location]
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  before_action :authenticate_user!, only: [:update_my_location, :update_location]
  before_action :disable_live_cache, only: [:live, :location, :update_location, :update_my_location]
  
  # GET /api/v1/commerces
  def index
    commerces = Commerce.includes(:user)
    
    # Application des filtres
    commerces = apply_location_filter(commerces) if location_params_present?
    commerces = commerces.where('LOWER(name) LIKE LOWER(?)', "%#{params[:search]}%") if params[:search].present?
    commerces = commerces.where(category: params[:category]) if params[:category].present?
    commerces = commerces.where('rating >= ?', params[:min_rating]) if params[:min_rating].present?
    commerces = commerces.where(verified: true) if params[:verified] == 'true'
    
    # Tri
    commerces = apply_sorting(commerces)
    
    # Pagination
    result = paginate_collection(commerces)
    
    render_success({
      commerces: result[:data].map { |commerce| commerce_data(commerce) },
      meta: result[:meta]
    })
  end
  
  # GET /api/v1/commerces/nearby
  def nearby
    coords = parse_required_coordinates
    return unless coords
    latitude, longitude, radius = coords

    commerces = Commerce.includes(:user)
                        .near([latitude, longitude], radius, order: :distance)
    
    # Application des autres filtres
    commerces = commerces.where(category: params[:category]) if params[:category].present?
    commerces = commerces.where('rating >= ?', params[:min_rating]) if params[:min_rating].present?
    commerces = commerces.where(verified: true) if params[:verified] == 'true'
    
    result = paginate_collection(commerces)
    
    render_success({
      commerces: result[:data].map { |commerce| commerce_data_with_distance(commerce, [latitude, longitude]) },
      meta: result[:meta]
    })
  end

  # GET /api/v1/commerces/live
  def live
    commerces = Commerce.includes(:user)
                        .joins(:user)
                        .where(users: { statut_type: User.statut_types[:itinerant] })
                        .where(is_online: true)

    coords = parse_optional_coordinates
    if coords
      latitude, longitude, radius = coords
      commerces = commerces.near([latitude, longitude], radius, order: :distance)

      return render_success({
        commerces: commerces.map { |commerce| commerce_data_with_distance(commerce, [latitude, longitude]) }
      })
    end

    render_success({
      commerces: commerces.map { |commerce| commerce_data(commerce) }
    })
  end

  # GET /api/v1/commerces/:id/location
  def location
    render_success({ commerce: commerce_location_data(@commerce) })
  end

  # PATCH /api/v1/commerces/:id/update_location
  def update_location
    unless can_manage_commerce?(@commerce)
      return render_error('Non autorisé à mettre à jour la position de ce commerce', :forbidden)
    end

    unless current_user.admin? || current_user.itinerant?
      return render_error('Seuls les commerçants itinérants peuvent publier une position live', :forbidden)
    end

    coords = parse_required_coordinates
    return unless coords
    latitude, longitude, _radius = coords
    is_online = params.key?(:is_online) ? ActiveModel::Type::Boolean.new.cast(params[:is_online]) : true

    if @commerce.update(
      latitude: latitude,
      longitude: longitude,
      is_online: is_online,
      location_updated_at: Time.current
    )
      render_success({ commerce: commerce_location_data(@commerce) }, message: 'Position mise à jour')
    else
      render_error(@commerce.errors.full_messages.join(', '))
    end
  end

  # PATCH /api/v1/commerces/update_my_location
  def update_my_location
    unless current_user.admin? || current_user.itinerant?
      return render_error('Seuls les commerçants itinérants peuvent publier une position live', :forbidden)
    end

    commerce = current_user.commerces.order(updated_at: :desc).first
    return render_not_found('Commerce') if commerce.nil?

    coords = parse_required_coordinates
    return unless coords
    latitude, longitude, _radius = coords
    is_online = params.key?(:is_online) ? ActiveModel::Type::Boolean.new.cast(params[:is_online]) : true

    if commerce.update(
      latitude: latitude,
      longitude: longitude,
      is_online: is_online,
      location_updated_at: Time.current
    )
      render_success({ commerce: commerce_location_data(commerce) }, message: 'Position live publiée')
    else
      render_error(commerce.errors.full_messages.join(', '))
    end
  end
  
  # GET /api/v1/commerces/search
  def search
    query = params[:query]
    return render_error('Paramètre query requis') if query.blank?
    
    # `description` is exposed by the API but the underlying DB column is `details`.
    # ILIKE is Postgres-only — LOWER + LIKE is portable to the SQLite dev DB.
    commerces = Commerce.includes(:user)
                        .where('LOWER(name) LIKE LOWER(?) OR LOWER(details) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?)',
                               "%#{query}%", "%#{query}%", "%#{query}%")
    
    # Géolocalisation optionnelle
    commerces = apply_location_filter(commerces) if location_params_present?
    
    # Autres filtres
    commerces = commerces.where(category: params[:category]) if params[:category].present?
    commerces = commerces.where('rating >= ?', params[:min_rating]) if params[:min_rating].present?
    commerces = commerces.where(verified: true) if params[:verified] == 'true'
    
    result = paginate_collection(commerces)
    
    render_success({
      commerces: result[:data].map { |commerce| commerce_data(commerce) },
      meta: result[:meta],
      query: query
    })
  end
  
  # GET /api/v1/commerces/:id
  def show
    render_success({
      commerce: commerce_data_detailed(@commerce)
    })
  end

  # GET /api/v1/commerces/:id/products
  def products
    # Utiliser l'association many-to-many via categorizations
    products = @commerce.products.includes(:categorizations)
    
    # Appliquer les filtres
    products = products.where('LOWER(name) LIKE LOWER(?)', "%#{params[:search]}%") if params[:search].present?
    products = products.where(category: params[:category]) if params[:category].present?
    products = products.where('unitprice >= ?', params[:min_price]) if params[:min_price].present?
    products = products.where('unitprice <= ?', params[:max_price]) if params[:max_price].present?
    products = products.where('unitsinstock > 0') if params[:available] == 'true'
    
    # Tri
    case params[:sort_by]
    when 'name'
      products = products.order(:name)
    when 'price'
      products = products.order(:unitprice)
    when 'stock'
      products = products.order(unitsinstock: :desc)
    else
      products = products.order(:name)
    end
    
    result = paginate_collection(products)
    
    render_success({
      products: result[:data].map { |product| product_data(product) },
      meta: result[:meta],
      commerce: {
        id: @commerce.id,
        name: @commerce.name
      }
    })
  end
  
  # POST /api/v1/commerces
  def create
    commerce = current_user.commerces.build(commerce_params)
    
    if commerce.save
      render_success({
        commerce: commerce_data_detailed(commerce)
      }, message: 'Commerce créé avec succès', status: :created)
    else
      render_error(commerce.errors.full_messages.join(', '))
    end
  end
  
  # PATCH /api/v1/commerces/:id
  def update
    unless can_manage_commerce?(@commerce)
      return render_error('Non autorisé à modifier ce commerce', :forbidden)
    end
    
    if @commerce.update(commerce_params)
      render_success({
        commerce: commerce_data_detailed(@commerce)
      }, message: 'Commerce mis à jour')
    else
      render_error(@commerce.errors.full_messages.join(', '))
    end
  end
  
  # DELETE /api/v1/commerces/:id
  def destroy
    unless can_manage_commerce?(@commerce)
      return render_error('Non autorisé à supprimer ce commerce', :forbidden)
    end
    
    @commerce.destroy
    render_success(nil, message: 'Commerce supprimé')
  end
  
  private
  
  def set_commerce
    @commerce = Commerce.includes(:user).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found('Commerce')
  end
  
  # Public API exposes `description` / `address`; DB columns are `details` /
  # `adress1`. Keep the API contract stable and translate here so callers don't
  # need to know the schema (mirrors the pattern in Api::V1::ProductsController).
  COMMERCE_PUBLIC_TO_DB_ATTR_MAP = {
    description: :details,
    address: :adress1
  }.freeze

  def commerce_params
    permitted = params.require(:commerce).permit(
      :name, :description, :address, :adress2, :postal, :city, :country,
      :latitude, :longitude, :phone, :website, :opening_hours, :image_url,
      :category, :verified
    )
    COMMERCE_PUBLIC_TO_DB_ATTR_MAP.each do |public_key, db_key|
      permitted[db_key] = permitted.delete(public_key) if permitted.key?(public_key)
    end
    permitted
  end
  
  def location_params_present?
    params[:latitude].present? && params[:longitude].present?
  end
  
  def apply_sorting(commerces)
    case params[:sort_by]
    when 'name'
      commerces.order(:name)
    when 'rating'
      commerces.order(rating: :desc)
    when 'created_at'
      commerces.order(created_at: :desc)
    else
      commerces.order(:name) # Défaut
    end
  end
  
  def can_manage_commerce?(commerce)
    current_user&.id == commerce.user_id || current_user&.admin?
  end
  
  def commerce_data(commerce)
    {
      id: commerce.id,
      name: commerce.name,
      description: commerce.details || "", 
      address: commerce.adress1 || "",
      latitude: commerce.latitude,
      longitude: commerce.longitude,
      phone: commerce.phone,
      website: commerce.website,
      openingHours: commerce.opening_hours,
      imageUrl: commerce.image_url,
      email: commerce.user&.email,
      category: commerce.category,
      type: commerce.user&.statut_type == 'itinerant' ? 'itinerant' : 'sedentary',
      # rating is a BigDecimal in the DB; JSON would emit "4.8" (string) — cast
      # so the React UI can call Number#toFixed without crashing.
      rating: (commerce.rating || 0).to_f,
      isVerified: commerce.verified || false,
      isOnline: commerce_online?(commerce),
      userId: commerce.user_id,
      createdAt: commerce.created_at.iso8601,
      updatedAt: commerce.updated_at.iso8601
    }
  end
  
  def commerce_data_with_distance(commerce, coordinates)
    data = commerce_data(commerce)
    data[:distance] = commerce.distance_from(coordinates).round(2) if coordinates
    data
  end
  
  def commerce_data_detailed(commerce)
    data = commerce_data(commerce)
    data.merge({
      productsCount: commerce.products.count,
      user: {
        id: commerce.user.id,
        name: commerce.user.name,
        email: commerce.user.email,
        role: commerce.user.statut_type
      }
    })
  end

  def product_data(product)
    # Shape aligned with Api::V1::ProductsController#product_data so the React
    # `Product` type works against both endpoints. BigDecimal columns are cast
    # to Float so the UI can call Number#toFixed safely.
    commerce = product.commerce || product.commerces_through_categorizations.first
    {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: (product.unitprice || 0).to_f,
      unit: product.quantityperunit,
      stock: product.unitsinstock || 0,
      category: product.category,
      imageUrl: product.image_url,
      isAvailable: (product.unitsinstock || 0) > 0,
      commerceId: commerce&.id,
      createdAt: product.created_at.iso8601,
      updatedAt: product.updated_at.iso8601,
      commerce: commerce && {
        id: commerce.id,
        name: commerce.name
      }
    }
  end

  def disable_live_cache
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
  end

  def commerce_location_data(commerce)
    {
      id: commerce.id,
      name: commerce.name,
      latitude: commerce.latitude,
      longitude: commerce.longitude,
      is_online: commerce_online?(commerce),
      last_update: commerce.location_updated_at&.iso8601
    }
  end

  def commerce_online?(commerce)
    return false unless commerce.is_online
    return true if commerce.location_updated_at.blank?

    commerce.location_updated_at >= 10.minutes.ago
  end
end
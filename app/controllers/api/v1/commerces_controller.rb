class Api::V1::CommercesController < Api::V1::BaseController
  # Skip authentication pour les endpoints publics de consultation
  skip_before_action :authenticate_user_from_token!, only: [:index, :nearby, :search, :show, :products]
  before_action :set_commerce, only: [:show, :update, :destroy, :products]
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  
  # GET /api/v1/commerces
  def index
    commerces = Commerce.includes(:user)
    
    # Application des filtres
    commerces = apply_location_filter(commerces) if location_params_present?
    commerces = commerces.where('name ILIKE ?', "%#{params[:search]}%") if params[:search].present?
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
    latitude = params[:latitude]&.to_f
    longitude = params[:longitude]&.to_f
    radius = params[:radius]&.to_f || 50
    
    unless latitude && longitude
      return render_error('Latitude et longitude requises')
    end
    
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
  
  # GET /api/v1/commerces/search
  def search
    query = params[:query]
    return render_error('Paramètre query requis') if query.blank?
    
    commerces = Commerce.includes(:user)
                        .where('name ILIKE ? OR description ILIKE ? OR category ILIKE ?', 
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
    products = products.where('name ILIKE ?', "%#{params[:search]}%") if params[:search].present?
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
  
  def commerce_params
    params.require(:commerce).permit(:name, :description, :address, :latitude, :longitude, 
                                   :phone, :email, :category, :verified)
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
      email: commerce.user&.email,
      category: commerce.category,
      rating: commerce.rating || 0,
      isVerified: commerce.verified || false,
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
    {
      id: product.id,
      name: product.name,
      description: product.description || "",
      unitPrice: product.unitprice,
      quantityPerUnit: product.quantityperunit,
      unitsInStock: product.unitsinstock,
      unitsOnOrder: product.unitsonorder || 0,
      category: product.category,
      available: (product.unitsinstock || 0) > 0,
      createdAt: product.created_at.iso8601,
      updatedAt: product.updated_at.iso8601,
      commerce: {
        id: product.commerce&.id,
        name: product.commerce&.name
      }
    }
  end
end
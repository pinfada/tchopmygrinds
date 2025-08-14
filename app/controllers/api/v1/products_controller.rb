class Api::V1::ProductsController < Api::V1::BaseController
  before_action :set_product, only: [:show, :update, :destroy]
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  
  # GET /api/v1/products
  def index
    products = Product.includes(:commerce)
    
    # Filtres
    products = products.joins(:commerce) if location_params_present?
    products = apply_location_filter(products, lat_param: :latitude, lng_param: :longitude) if location_params_present?
    products = products.where('products.name ILIKE ? OR products.description ILIKE ?', "%#{params[:search]}%", "%#{params[:search]}%") if params[:search].present?
    products = products.where(category: params[:category]) if params[:category].present?
    products = products.where('price >= ?', params[:min_price]) if params[:min_price].present?
    products = products.where('price <= ?', params[:max_price]) if params[:max_price].present?
    products = products.where(commerce_id: params[:commerce_id]) if params[:commerce_id].present?
    products = products.where(available: true) if params[:available] == 'true'
    products = products.where('stock > 0') if params[:in_stock] == 'true'
    
    # Tri
    products = apply_product_sorting(products)
    
    # Pagination
    result = paginate_collection(products)
    
    render_success({
      products: result[:data].map { |product| product_data(product) },
      meta: result[:meta]
    })
  end
  
  # GET /api/v1/products/search
  def search
    query = params[:query]
    return render_error('Paramètre query requis') if query.blank?
    
    products = Product.includes(:commerce)
                     .where('products.name ILIKE ? OR products.description ILIKE ? OR products.category ILIKE ?', 
                            "%#{query}%", "%#{query}%", "%#{query}%")
    
    # Géolocalisation optionnelle pour les commerces
    if location_params_present?
      products = products.joins(:commerce)
      products = apply_location_filter(products)
    end
    
    # Autres filtres
    products = products.where(category: params[:category]) if params[:category].present?
    products = products.where('price >= ?', params[:min_price]) if params[:min_price].present?
    products = products.where('price <= ?', params[:max_price]) if params[:max_price].present?
    products = products.where(available: true) if params[:available] == 'true'
    
    result = paginate_collection(products)
    
    render_success({
      products: result[:data].map { |product| product_data_with_commerce(product) },
      meta: result[:meta],
      query: query
    })
  end
  
  # GET /api/v1/products/:id
  def show
    render_success({
      product: product_data_detailed(@product)
    })
  end
  
  # GET /api/v1/products/categories
  def categories
    categories = Product.distinct.pluck(:category).compact.sort
    
    render_success({
      categories: categories
    })
  end
  
  # POST /api/v1/products
  def create
    commerce = current_user.commerces.find(params[:commerce_id])
    product = commerce.products.build(product_params)
    
    if product.save
      render_success({
        product: product_data_detailed(product)
      }, message: 'Produit créé avec succès', status: :created)
    else
      render_error(product.errors.full_messages.join(', '))
    end
  rescue ActiveRecord::RecordNotFound
    render_not_found('Commerce')
  end
  
  # PATCH /api/v1/products/:id
  def update
    unless can_manage_product?(@product)
      return render_error('Non autorisé à modifier ce produit', :forbidden)
    end
    
    if @product.update(product_params)
      render_success({
        product: product_data_detailed(@product)
      }, message: 'Produit mis à jour')
    else
      render_error(@product.errors.full_messages.join(', '))
    end
  end
  
  # DELETE /api/v1/products/:id
  def destroy
    unless can_manage_product?(@product)
      return render_error('Non autorisé à supprimer ce produit', :forbidden)
    end
    
    @product.destroy
    render_success(nil, message: 'Produit supprimé')
  end
  
  # GET /api/v1/products/:id/price_history
  def price_history
    # Historique des prix pour graphiques
    # TODO: Implémenter si table price_history existe
    render_success({
      price_history: [
        { date: 1.month.ago.to_date, price: @product.price * 0.9 },
        { date: 2.weeks.ago.to_date, price: @product.price * 0.95 },
        { date: Date.current, price: @product.price }
      ]
    })
  end
  
  private
  
  def set_product
    @product = Product.includes(:commerce).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found('Produit')
  end
  
  def product_params
    params.require(:product).permit(:name, :description, :price, :unit, :category, 
                                  :image_url, :stock, :available)
  end
  
  def location_params_present?
    params[:latitude].present? && params[:longitude].present?
  end
  
  def apply_product_sorting(products)
    case params[:sort_by]
    when 'name'
      products.order('products.name')
    when 'price'
      products.order('products.price')
    when 'rating'
      products.joins(:commerce).order('commerces.rating DESC')
    when 'distance'
      # Géré par apply_location_filter si coordonnées présentes
      location_params_present? ? products : products.order('products.name')
    when 'created_at'
      products.order('products.created_at DESC')
    else
      products.order('products.name') # Défaut
    end
  end
  
  def can_manage_product?(product)
    return false unless current_user
    current_user.id == product.commerce.user_id || current_user.admin?
  end
  
  def product_data(product)
    {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.unitprice,
      unit: product.quantityperunit,
      category: product.category,
      imageUrl: product.image_url,
      stock: product.unitsinstock,
      isAvailable: product.available,
      commerceId: product.commerce_id,
      createdAt: product.created_at.iso8601,
      updatedAt: product.updated_at.iso8601
    }
  end
  
  def product_data_with_commerce(product)
    data = product_data(product)
    if product.commerce
      data[:commerce] = {
        id: product.commerce.id,
        name: product.commerce.name,
        address: product.commerce.address,
        rating: product.commerce.rating || 0,
        distance: product.commerce.respond_to?(:distance) ? product.commerce.distance&.round(2) : nil
      }
    end
    data
  end
  
  def product_data_detailed(product)
    data = product_data_with_commerce(product)
    if product.commerce
      data[:commerce].merge!({
        latitude: product.commerce.latitude,
        longitude: product.commerce.longitude,
        phone: product.commerce.phone,
        category: product.commerce.category,
        isVerified: product.commerce.verified || false
      })
    end
    data
  end
end
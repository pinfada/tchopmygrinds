class Api::V1::ProductsController < Api::V1::BaseController
  # Skip authentication pour les endpoints publics de consultation
  skip_before_action :authenticate_user_from_token!, only: [:index, :search, :categories, :show]
  before_action :set_product, only: [:show, :update, :destroy]
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  
  # GET /api/v1/products
  def index
    products = Product.includes(:commerce, :commerces_through_categorizations)

    # Geo filter. apply_location_filter now handles the join via the
    # commerce association internally — no need to pre-join here (which
    # would also have filtered on the always-null products.commerce_id).
    products = apply_location_filter(products) if location_params_present?
    # Portable case-insensitive match: ILIKE is Postgres-only and crashes the
    # SQLite dev DB. LOWER(col) LIKE LOWER(?) works on both adapters.
    products = products.where('LOWER(products.name) LIKE LOWER(?) OR LOWER(products.description) LIKE LOWER(?)', "%#{params[:search]}%", "%#{params[:search]}%") if params[:search].present?
    products = products.where(category: params[:category]) if params[:category].present?
    products = products.where('unitprice >= ?', params[:min_price]) if params[:min_price].present?
    products = products.where('unitprice <= ?', params[:max_price]) if params[:max_price].present?
    # Products↔Commerce is a has_many :through :categorizations relation in this
    # codebase (the direct products.commerce_id column is null on seed data),
    # so filter through the join table — `where(commerce_id: …)` would always
    # return 0 rows.
    if params[:commerce_id].present?
      products = products.joins(:categorizations)
                         .where(categorizations: { commerce_id: params[:commerce_id] })
                         .distinct
    end
    products = products.where(available: true) if params[:available] == 'true'
    products = products.where('unitsinstock > 0') if params[:in_stock] == 'true'
    
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
                     .where('LOWER(products.name) LIKE LOWER(?) OR LOWER(products.description) LIKE LOWER(?) OR LOWER(products.category) LIKE LOWER(?)',
                            "%#{query}%", "%#{query}%", "%#{query}%")
    
    # Géolocalisation optionnelle pour les commerces (apply_location_filter
    # handles the join via the commerce association on its own).
    products = apply_location_filter(products) if location_params_present?
    
    # Autres filtres
    products = products.where(category: params[:category]) if params[:category].present?
    products = products.where('unitprice >= ?', params[:min_price]) if params[:min_price].present?
    products = products.where('unitprice <= ?', params[:max_price]) if params[:max_price].present?
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
    # Use create (not build + save) so the has_many :through categorization is
    # persisted alongside the product — matching the seed pattern.
    product = commerce.products.create(product_params)

    if product.persisted?
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
  
  # Public API uses price/unit/stock; DB columns are unitprice/quantityperunit/unitsinstock.
  # Keep the API contract and map here so callers don't need to know the schema.
  PUBLIC_TO_DB_ATTR_MAP = {
    price: :unitprice,
    unit: :quantityperunit,
    stock: :unitsinstock
  }.freeze

  def product_params
    permitted = params.require(:product).permit(:name, :description, :price, :unit, :category,
                                                :image_url, :stock, :available)
    PUBLIC_TO_DB_ATTR_MAP.each do |public_key, db_key|
      permitted[db_key] = permitted.delete(public_key) if permitted.key?(public_key)
    end
    # unitsonorder is NOT NULL with no DB default — initialise to 0 on create.
    permitted[:unitsonorder] = 0 if action_name == 'create' && permitted[:unitsonorder].blank?
    permitted
  end
  
  def location_params_present?
    params[:latitude].present? && params[:longitude].present?
  end
  
  def apply_product_sorting(products)
    case params[:sort_by]
    when 'name'
      products.order('products.name')
    when 'price'
      products.order('products.unitprice')
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
  
  # Products are linked to commerces both via a direct FK (products.commerce_id)
  # and a m2m join (categorizations). Seed data only populates the m2m side,
  # so always fall back to the join when the direct FK is null — otherwise the
  # API returns "commerceId: null" and the UI can't show where to buy.
  def effective_commerce(product)
    product.commerce || product.commerces_through_categorizations.first
  end

  def product_data(product)
    commerce = effective_commerce(product)
    {
      id: product.id,
      name: product.name,
      description: product.description || "",
      # unitprice is BigDecimal — cast so the UI can call Number#toFixed safely.
      price: (product.unitprice || 0).to_f,
      unit: product.quantityperunit,
      category: product.category,
      imageUrl: product.image_url,
      stock: product.unitsinstock,
      isAvailable: product.available,
      commerceId: commerce&.id,
      createdAt: product.created_at.iso8601,
      updatedAt: product.updated_at.iso8601
    }
  end

  def product_data_with_commerce(product)
    data = product_data(product)
    commerce = effective_commerce(product)
    if commerce
      data[:commerce] = {
        id: commerce.id,
        name: commerce.name,
        address: commerce.adress1,
        rating: (commerce.rating || 0).to_f,
        distance: commerce.respond_to?(:distance) ? commerce.distance&.round(2) : nil
      }
    end
    data
  end

  def product_data_detailed(product)
    data = product_data_with_commerce(product)
    commerce = effective_commerce(product)
    if commerce && data[:commerce]
      data[:commerce].merge!({
        latitude: commerce.latitude,
        longitude: commerce.longitude,
        phone: commerce.phone,
        website: commerce.website,
        openingHours: commerce.opening_hours,
        category: commerce.category,
        isVerified: commerce.verified || false
      })
    end
    data
  end
end
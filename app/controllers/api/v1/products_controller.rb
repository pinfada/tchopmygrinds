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
    products = tokenized_search(products, params[:search], %i[name description]) if params[:search].present?
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
    
    products = tokenized_search(
      Product.includes(:commerce, :commerces_through_categorizations),
      query,
      %i[name description category]
    )
    
    # Géolocalisation optionnelle pour les commerces (apply_location_filter
    # handles the join via the commerce association on its own).
    products = apply_location_filter(products) if location_params_present?

    # Autres filtres
    products = products.where(category: params[:category]) if params[:category].present?
    products = products.where('unitprice >= ?', params[:min_price]) if params[:min_price].present?
    products = products.where('unitprice <= ?', params[:max_price]) if params[:max_price].present?
    products = products.where(available: true) if params[:available] == 'true'

    # Re-apply ordering explicitly: apply_location_filter strips Commerce.near's
    # alias-based ORDER BY (breaks Kaminari id-only pagination), so closest-first
    # ordering must be opted into here. Falls back to name for non-geo searches.
    products = location_params_present? ? products_ordered_by_distance(products) : products.order('products.name')

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
      products_ordered_by_distance(products)
    when 'created_at'
      products.order('products.created_at DESC')
    else
      products.order('products.name') # Défaut
    end
  end

  # Distance ordering can't rely on Commerce.near's `distance` alias because
  # apply_location_filter unscopes it (see base_controller — the alias breaks
  # Kaminari's id-only DISTINCT subquery). Re-emit the raw distance expression
  # so the ORDER BY stays valid even when Rails reduces the SELECT to ids.
  def products_ordered_by_distance(products)
    coords = parse_optional_coordinates
    return products.order('products.name') unless coords

    lat, lng, _ = coords
    distance_expr = Commerce.distance_sql(lat, lng)
    products.order(Arel.sql("#{distance_expr} ASC"))
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
      # Currency follows the commerce, not the product — a single shop sells
      # in one currency. Surfaced here too so cart/order lines that only carry
      # a product reference can render the price without re-fetching the shop.
      currency: commerce&.currency || 'EUR',
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
        # userId is the merchant's User row id — the product card needs it to
        # call start_conversation when the buyer taps "Contacter".
        userId: commerce.user_id,
        name: commerce.name,
        address: commerce.adress1,
        rating: (commerce.rating || 0).to_f,
        distance: commerce.respond_to?(:distance) ? commerce.distance&.round(2) : nil,
        currency: commerce.currency,
        merchantName: commerce.user&.name,
        merchantWhatsappPhone: commerce.user&.whatsapp_phone
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
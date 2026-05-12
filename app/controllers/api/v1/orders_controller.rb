class Api::V1::OrdersController < Api::V1::BaseController
  # Raised when a product no longer has enough stock to satisfy an order line.
  # Used to bubble out of the surrounding transaction with a 422 response.
  class InsufficientStock < StandardError; end

  before_action :authenticate_user!
  before_action :set_order, only: [:show, :update, :cancel]
  
  # GET /api/v1/orders
  def index
    orders = current_user.orders.includes(:orderdetails, products: :commerce)
    
    # Filtres
    orders = orders.where(status: params[:status]) if params[:status].present?
    orders = orders.where('created_at >= ?', params[:from_date]) if params[:from_date].present?
    orders = orders.where('created_at <= ?', params[:to_date]) if params[:to_date].present?
    
    # Tri par date décroissante
    orders = orders.order(created_at: :desc)
    
    result = paginate_collection(orders)
    
    render_success({
      orders: result[:data].map { |order| order_data(order) },
      meta: result[:meta]
    })
  end
  
  # GET /api/v1/orders/:id
  def show
    render_success({
      order: order_data_detailed(@order)
    })
  end
  
  # POST /api/v1/orders
  def create
    order = current_user.orders.build(order_create_params)
    order.status = 'Waiting'

    items = params[:items].is_a?(Array) ? params[:items] : []
    if items.empty?
      return render_error('Aucun article dans la commande')
    end

    begin
      ActiveRecord::Base.transaction do
        order.save!

        items.each do |item_params|
          product_id = item_params[:product_id] || item_params[:productId]
          product = Product.find(product_id)
          quantity = item_params[:quantity].to_i
          raise InsufficientStock, "Quantité invalide pour #{product.name}" if quantity <= 0

          # Atomic conditional decrement. The WHERE clause and UPDATE happen in
          # a single SQL statement, so two concurrent requests cannot both pass
          # the stock check and oversell. If another transaction already
          # decremented below `quantity`, `update_all` affects 0 rows and we
          # raise to roll back the whole order.
          affected = Product.where(id: product.id)
                            .where("unitsinstock >= ?", quantity)
                            .update_all(["unitsinstock = unitsinstock - ?", quantity])

          raise InsufficientStock, "Stock insuffisant pour #{product.name}" if affected.zero?

          order.orderdetails.create!(
            product: product,
            quantity: quantity,
            unitprice: product.unitprice,
            discount: 0
          )
        end

        total = order.orderdetails.sum { |d| d.unitprice.to_f * d.quantity * (1 - d.discount.to_f) }
        order.update!(total_amount: total)
      end

      render_success({
        order: order_data_detailed(order)
      }, message: 'Commande créée avec succès', status: :created)

    rescue InsufficientStock => e
      render_error(e.message)
    rescue ActiveRecord::RecordInvalid => e
      render_error("Erreur lors de la création: #{e.message}")
    rescue ActiveRecord::RecordNotFound
      render_error('Un ou plusieurs produits n\'existent pas')
    end
  end
  
  # PATCH /api/v1/orders/:id
  def update
    # Seuls certains champs peuvent être mis à jour
    unless can_update_order?(@order)
      return render_error('Non autorisé à modifier cette commande', :forbidden)
    end
    
    if @order.update(order_update_params)
      # Notification si changement de statut
      if @order.saved_change_to_status?
        # OrderMailer.order_status_changed(@order).deliver_later
      end
      
      render_success({
        order: order_data_detailed(@order)
      }, message: 'Commande mise à jour')
    else
      render_error(@order.errors.full_messages.join(', '))
    end
  end
  
  # PATCH /api/v1/orders/:id/cancel
  def cancel
    unless can_cancel_order?(@order)
      return render_error('Cette commande ne peut pas être annulée', :forbidden)
    end
    
    begin
      ActiveRecord::Base.transaction do
        # Remettre les produits en stock
        @order.orderdetails.includes(:product).each do |detail|
          detail.product.increment!(:unitsinstock, detail.quantity)
        end
        
        @order.update!(status: 'Cancelled')
      end
      
      render_success({
        order: order_data_detailed(@order)
      }, message: 'Commande annulée')
      
    rescue ActiveRecord::RecordInvalid => e
      render_error("Erreur lors de l'annulation: #{e.message}")
    end
  end
  
  # GET /api/v1/orders/stats
  def stats
    orders = current_user.orders

    stats = {
      total_orders: orders.count,
      pending_orders: orders.where(status: 'Waiting').count,
      completed_orders: orders.where(status: 'Delivered').count,
      cancelled_orders: orders.where(status: 'Cancelled').count,
      total_spent: orders.where.not(status: 'Cancelled').sum(:total_amount),
      orders_this_month: orders.where(created_at: Time.current.beginning_of_month..Time.current).count
    }

    render_success({ stats: stats })
  end
  
  private
  
  def set_order
    @order = current_user.orders.includes(:orderdetails, products: :commerce).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found('Commande')
  end
  
  ALLOWED_PAYMENT_METHODS = %w[cash card].freeze

  def order_create_params
    {
      phone: params[:phone].to_s.presence,
      notes: params[:notes].to_s.presence,
      delivery_address: format_delivery_address(params[:deliveryAddress] || params[:delivery_address]),
      payment_method: parse_payment_method(params[:paymentMethod] || params[:payment_method]),
      delivery_fee: parse_decimal(params[:deliveryFee] || params[:delivery_fee]),
    }.compact
  end

  def parse_payment_method(value)
    method = value.to_s.downcase.presence
    ALLOWED_PAYMENT_METHODS.include?(method) ? method : nil
  end

  def parse_decimal(value)
    return nil if value.nil? || value.to_s.strip.empty?
    parsed = Float(value) rescue nil
    return nil if parsed.nil? || parsed.negative?
    parsed
  end

  # Le frontend envoie soit une string, soit un objet {street, city, postalCode, country, ...}.
  # La colonne DB est un string simple — on aplatit la version structurée.
  def format_delivery_address(input)
    return nil if input.blank?
    return input.to_s if input.is_a?(String)
    return nil unless input.respond_to?(:[])

    parts = [
      input[:street]     || input['street'],
      input[:city]       || input['city'],
      input[:postalCode] || input['postalCode'] || input[:postal_code] || input['postal_code'],
      input[:country]    || input['country'],
    ].map { |s| s.to_s.strip }.reject(&:empty?)

    parts.empty? ? nil : parts.join(', ')
  end
  
  def order_update_params
    allowed_params = [:delivery_address, :phone, :notes]
    
    # Les marchands peuvent changer le statut
    if current_user_is_merchant_for_order?(@order)
      allowed_params << :status
    end
    
    params.permit(allowed_params)
  end
  
  def can_update_order?(order)
    # Le client peut modifier certains champs si commande en attente
    return true if order.user_id == current_user.id && order.status == 'Waiting'

    # Le marchand peut modifier le statut
    return true if current_user_is_merchant_for_order?(order)

    false
  end

  def can_cancel_order?(order)
    return false unless order.user_id == current_user.id
    return false if order.status.in?(['Delivered', 'Cancelled'])

    true
  end
  
  def current_user_is_merchant_for_order?(order)
    commerce_ids = order.products.pluck(:commerce_id).uniq
    current_user.commerces.pluck(:id).any? { |id| commerce_ids.include?(id) }
  end
  
  def order_data(order)
    total_amount = order.total_amount.to_f
    delivery_fee = order.delivery_fee.to_f
    {
      id: order.id,
      status: order.status,
      totalAmount: total_amount,
      deliveryFee: delivery_fee,
      grandTotal: total_amount + delivery_fee,
      paymentMethod: order.payment_method,
      deliveryAddress: order.delivery_address,
      phone: order.phone,
      notes: order.notes,
      itemsCount: order.orderdetails.count,
      createdAt: order.created_at.iso8601,
      updatedAt: order.updated_at.iso8601,
      cancelledAt: order.respond_to?(:cancelled_at) ? order.cancelled_at&.iso8601 : nil
    }
  end
  
  def order_data_detailed(order)
    data = order_data(order)
    data[:items] = order.orderdetails.includes(product: :commerce).map do |detail|
      product = detail.product
      commerce = product&.commerce
      {
        id: detail.id,
        quantity: detail.quantity,
        unitPrice: detail.unitprice,
        totalPrice: detail.unitprice.to_f * detail.quantity * (1 - detail.discount.to_f),
        product: product && {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.image_url,
          unit: product.quantityperunit,
          category: product.category,
          commerce: commerce && {
            id: commerce.id,
            name: commerce.name,
            address: commerce_address(commerce)
          }
        }
      }
    end
    data
  end

  def commerce_address(commerce)
    [commerce.adress1, commerce.adress2, commerce.city, commerce.postal, commerce.country]
      .map { |s| s.to_s.strip }
      .reject(&:empty?)
      .join(', ')
      .presence
  end
end
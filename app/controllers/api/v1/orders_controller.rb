class Api::V1::OrdersController < Api::V1::BaseController
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
    order.status = 'pending'
    
    begin
      ActiveRecord::Base.transaction do
        order.save!
        
        # Créer les détails de commande
        params[:items].each do |item_params|
          product = Product.find(item_params[:product_id])
          
          # Vérifier le stock
          if product.unitsinstock < item_params[:quantity].to_i
            raise ActiveRecord::Rollback, "Stock insuffisant pour #{product.name}"
          end
          
          order_detail = order.orderdetails.build(
            product: product,
            quantity: item_params[:quantity],
            unitprice: product.unitprice,
            discount: 0
          )
          order_detail.save!
          
          # Décrémenter le stock
          product.update!(unitsinstock: product.unitsinstock - item_params[:quantity].to_i)
        end
        
        # Calculer le total
        # Calculer le total manuellement 
        total = order.orderdetails.sum { |d| d.unitprice * d.quantity * (1 - d.discount) }
        order.update!(total_amount: total)
      end
      
      # Envoyer notification email (si configuré)
      # OrderMailer.order_created(order).deliver_later
      
      render_success({
        order: order_data_detailed(order)
      }, message: 'Commande créée avec succès', status: :created)
      
    rescue ActiveRecord::RecordInvalid => e
      render_error("Erreur lors de la création: #{e.message}")
    rescue ActiveRecord::Rollback => e
      render_error(e.message)
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
      pending_orders: orders.where(status: 'pending').count,
      completed_orders: orders.where(status: 'delivered').count,
      cancelled_orders: orders.where(status: 'cancelled').count,
      total_spent: orders.where.not(status: 'cancelled').sum(:total_amount),
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
  
  def order_create_params
    params.permit(:delivery_address, :phone, :notes)
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
    return true if order.user_id == current_user.id && order.status == 'pending'
    
    # Le marchand peut modifier le statut
    return true if current_user_is_merchant_for_order?(order)
    
    false
  end
  
  def can_cancel_order?(order)
    return false unless order.user_id == current_user.id
    return false if order.status.in?(['delivered', 'cancelled'])
    
    true
  end
  
  def current_user_is_merchant_for_order?(order)
    commerce_ids = order.products.pluck(:commerce_id).uniq
    current_user.commerces.pluck(:id).any? { |id| commerce_ids.include?(id) }
  end
  
  def order_data(order)
    {
      id: order.id,
      status: order.status,
      totalAmount: order.total_amount,
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
    data[:items] = order.orderdetails.includes(:product).map do |detail|
      {
        id: detail.id,
        quantity: detail.quantity,
        unitPrice: detail.unitprice,
        totalPrice: detail.unitprice * detail.quantity * (1 - detail.discount),
        product: {
          id: detail.product.id,
          name: detail.product.name,
          description: detail.product.description,
          imageUrl: detail.product.image_url,
          unit: detail.product.unit,
          category: detail.product.category,
          commerce: {
            id: detail.product.commerce.id,
            name: detail.product.commerce.name,
            address: detail.product.commerce.address
          }
        }
      }
    end
    data
  end
end
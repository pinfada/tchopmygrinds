class Api::V1::ProductInterestsController < Api::V1::ApplicationController
  before_action :authenticate_user!
  before_action :set_product_interest, only: [:show, :destroy]

  def index
    @product_interests = current_user.product_interests
                                   .includes(:user)
                                   .order(created_at: :desc)
                                   .page(params[:page])
                                   .per(params[:per_page] || 10)

    render json: {
      product_interests: @product_interests.map { |interest| format_interest(interest) },
      meta: pagination_meta(@product_interests)
    }
  end

  def show
    render json: { product_interest: format_interest(@product_interest) }
  end

  def create
    @product_interest = current_user.product_interests.build(product_interest_params)
    
    # Récupérer la position actuelle de l'utilisateur
    if params[:latitude].present? && params[:longitude].present?
      @product_interest.user_latitude = params[:latitude]
      @product_interest.user_longitude = params[:longitude]
    end

    if @product_interest.save
      # Vérifier immédiatement s'il y a des produits disponibles
      check_immediate_availability

      render json: {
        product_interest: format_interest(@product_interest),
        message: 'Manifestation d\'intérêt enregistrée avec succès'
      }, status: :created
    else
      render json: {
        errors: @product_interest.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @product_interest.destroy
    render json: { message: 'Manifestation d\'intérêt supprimée' }
  end

  # Endpoint pour les marchands : voir les manifestations d'intérêt pour leurs produits
  def for_merchant
    return render json: { error: 'Accès non autorisé' }, status: :forbidden unless merchant?

    commerce_ids = current_user.commerces.pluck(:id)
    product_names = Product.where(commerce_id: commerce_ids).pluck(:name).uniq

    @interests = ProductInterest.active
                               .where('LOWER(product_name) IN (?)', product_names.map(&:downcase))
                               .includes(:user)
                               .order(created_at: :desc)
                               .page(params[:page])
                               .per(params[:per_page] || 10)

    render json: {
      product_interests: @interests.map { |interest| format_merchant_interest(interest) },
      meta: pagination_meta(@interests)
    }
  end

  # Endpoint pour notifier de la disponibilité d'un produit
  def notify_availability
    return render json: { error: 'Accès non autorisé' }, status: :forbidden unless merchant?

    product = Product.find(params[:product_id])
    return render json: { error: 'Produit introuvable' }, status: :not_found unless product

    # Vérifier que le marchand possède ce produit
    unless current_user.commerces.include?(product.commerce)
      return render json: { error: 'Produit non autorisé' }, status: :forbidden
    end

    # Trouver les manifestations d'intérêt correspondantes
    interests = ProductInterest.active
                              .for_product(product.name)
                              .in_area(
                                product.commerce.latitude,
                                product.commerce.longitude,
                                params[:radius] || 50
                              )

    notifications_sent = 0
    interests.each do |interest|
      if !interest.email_sent
        UserMailer.product_available_notification(interest, product).deliver_later
        interest.update!(email_sent: true)
        notifications_sent += 1
      end
    end

    render json: {
      message: "#{notifications_sent} notifications envoyées",
      interests_notified: notifications_sent
    }
  end

  private

  def set_product_interest
    @product_interest = current_user.product_interests.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Manifestation d\'intérêt introuvable' }, status: :not_found
  end

  def product_interest_params
    params.require(:product_interest).permit(:product_name, :message, :search_radius)
  end

  def format_interest(interest)
    {
      id: interest.id,
      product_name: interest.product_name,
      message: interest.message,
      search_radius: interest.search_radius,
      fulfilled: interest.fulfilled,
      fulfilled_at: interest.fulfilled_at,
      email_sent: interest.email_sent,
      created_at: interest.created_at,
      updated_at: interest.updated_at,
      user_latitude: interest.user_latitude,
      user_longitude: interest.user_longitude
    }
  end

  def format_merchant_interest(interest)
    {
      id: interest.id,
      product_name: interest.product_name,
      message: interest.message,
      search_radius: interest.search_radius,
      created_at: interest.created_at,
      user: {
        id: interest.user.id,
        name: interest.user.name,
        email: interest.user.email
      },
      distance: interest.distance_from(
        current_user.commerces.first&.latitude,
        current_user.commerces.first&.longitude
      )&.round(2)
    }
  end

  def check_immediate_availability
    # Chercher des produits disponibles dans la zone
    available_products = Product.joins(:commerce)
                               .where('LOWER(products.name) LIKE LOWER(?)', "%#{@product_interest.product_name}%")
                               .where('products.unitsinstock > 0')
                               .where(
                                 "6371 * acos(cos(radians(?)) * cos(radians(commerces.latitude)) * 
                                  cos(radians(commerces.longitude) - radians(?)) + 
                                  sin(radians(?)) * sin(radians(commerces.latitude))) <= ?",
                                 @product_interest.user_latitude,
                                 @product_interest.user_longitude,
                                 @product_interest.user_latitude,
                                 @product_interest.search_radius
                               )

    if available_products.any?
      UserMailer.immediate_product_availability(@product_interest, available_products.first).deliver_later
      @product_interest.update!(email_sent: true)
    end
  end

  def merchant?
    current_user.statut_type.in?(['itinerant', 'sedentary'])
  end

  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      next_page: collection.next_page,
      prev_page: collection.prev_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end
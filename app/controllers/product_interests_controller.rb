class ProductInterestsController < ApplicationController
  before_action :authenticate_user!
  respond_to :json
  
  # POST /product_interests
  # Créer une nouvelle manifestation d'intérêt
  def create
    @interest = current_user.product_interests.build(interest_params)
    
    if @interest.save
      # Vérifier immédiatement s'il y a des vendeurs disponibles
      check_immediate_availability
      
      render json: {
        success: true,
        message: "Votre intérêt a été enregistré. Vous serez notifié dès qu'un vendeur sera disponible.",
        interest: @interest
      }, status: :created
    else
      render json: {
        success: false,
        errors: @interest.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # GET /product_interests
  # Liste des intérêts de l'utilisateur
  def index
    @interests = current_user.product_interests
                            .order(created_at: :desc)
                            .includes(:user)
    
    render json: @interests.map { |interest|
      {
        id: interest.id,
        product_name: interest.product_name,
        search_radius: interest.search_radius,
        message: interest.message,
        fulfilled: interest.fulfilled,
        created_at: interest.created_at,
        fulfilled_at: interest.fulfilled_at
      }
    }
  end
  
  # DELETE /product_interests/:id
  # Supprimer une manifestation d'intérêt
  def destroy
    @interest = current_user.product_interests.find(params[:id])
    @interest.destroy
    
    render json: { success: true, message: "Manifestation d'intérêt supprimée" }
  rescue ActiveRecord::RecordNotFound
    render json: { success: false, error: "Manifestation d'intérêt non trouvée" }, status: :not_found
  end
  
  # GET /product_interests/for_merchants
  # POUR LES MARCHANDS : Voir les demandes de produits dans leur zone
  def for_merchants
    unless current_user.seller_role?
      render json: { error: "Accès autorisé aux marchands uniquement" }, status: :forbidden
      return
    end
    
    # Récupérer les commerces de l'utilisateur
    user_commerces = current_user.commerces.where.not(latitude: nil, longitude: nil)
    
    if user_commerces.empty?
      render json: { interests: [], message: "Aucun commerce géolocalisé trouvé" }
      return
    end
    
    # Chercher les intérêts dans la zone des commerces de l'utilisateur
    nearby_interests = []
    
    user_commerces.each do |commerce|
      interests = ProductInterest.active
                                 .in_area(commerce.latitude, commerce.longitude, 50) # 50km de rayon
                                 .where('created_at > ?', 30.days.ago) # Derniers 30 jours
      
      interests.each do |interest|
        distance = interest.distance_from(commerce.latitude, commerce.longitude)
        next if distance > 50 # Double vérification du rayon
        
        nearby_interests << {
          id: interest.id,
          product_name: interest.product_name,
          message: interest.message,
          search_radius: interest.search_radius,
          distance_from_commerce: distance.round(1),
          created_at: interest.created_at,
          user_email: interest.user.email, # Pour contact (optionnel selon RGPD)
          commerce_name: commerce.nom,
          commerce_id: commerce.id
        }
      end
    end
    
    # Trier par proximité et date de création
    nearby_interests.sort! do |a, b|
      [a[:distance_from_commerce], -a[:created_at].to_i] <=> [b[:distance_from_commerce], -b[:created_at].to_i]
    end
    
    render json: {
      interests: nearby_interests,
      total: nearby_interests.size,
      message: "#{nearby_interests.size} manifestation(s) d'intérêt trouvée(s) dans votre zone"
    }
  end
  
  private
  
  def interest_params
    params.require(:product_interest).permit(
      :product_name, :user_latitude, :user_longitude, :search_radius, :message
    )
  end
  
  # Vérifier s'il y a déjà des vendeurs disponibles pour ce produit
  def check_immediate_availability
    return unless @interest.persisted?
    
    # Rechercher des produits correspondants dans la zone
    available_products = Product.where("LOWER(nom) LIKE LOWER(?)", "%#{@interest.product_name}%")
                               .where("unitsinstock > 0")
                               .includes(:commerces)
    
    matching_commerces = []
    
    available_products.each do |product|
      product.commerces.each do |commerce|
        next unless commerce.latitude && commerce.longitude
        
        distance = @interest.distance_from(commerce.latitude, commerce.longitude)
        if distance && distance <= @interest.search_radius
          matching_commerces << {
            commerce: commerce,
            product: product,
            distance: distance
          }
        end
      end
    end
    
    # Si on trouve des vendeurs, envoyer une notification immédiate
    if matching_commerces.any?
      NotificationMailer.immediate_product_available(@interest, matching_commerces).deliver_later
      @interest.update!(email_sent: true)
    end
  end
end
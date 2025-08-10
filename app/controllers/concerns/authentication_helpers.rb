module AuthenticationHelpers
  extend ActiveSupport::Concern
  
  # Méthodes d'instance pour les contrôleurs
  included do
    # Callback pour vérifier l'authentification
    def require_authentication!
      unless user_signed_in?
        respond_to do |format|
          format.html { redirect_to new_user_session_path, alert: 'Vous devez être connecté pour accéder à cette page.' }
          format.json { render json: { error: 'Authentication required' }, status: :unauthorized }
        end
      end
    end
    
    # Callback pour vérifier le rôle vendeur
    def require_seller_role!
      require_authentication!
      unless current_user&.seller_role?
        respond_to do |format|
          format.html { redirect_to root_path, alert: 'Accès réservé aux vendeurs.' }
          format.json { render json: { error: 'Seller role required' }, status: :forbidden }
        end
      end
    end
    
    # Callback pour vérifier le rôle acheteur
    def require_buyer_role!
      require_authentication!
      unless current_user&.buyerRole?
        respond_to do |format|
          format.html { redirect_to root_path, alert: 'Accès réservé aux acheteurs.' }
          format.json { render json: { error: 'Buyer role required' }, status: :forbidden }
        end
      end
    end
  end
  
  # Méthodes d'instance
  
  # Données utilisateur sécurisées pour JavaScript
  def current_user_json
    return {} unless user_signed_in?
    
    {
      id: current_user.id,
      name: current_user.name,
      email: current_user.email,
      seller_role: current_user.seller_role?,
      buyerRole: current_user.buyerRole?,
      statut_type: current_user.statut_type,
      initials: user_initials
    }
  end
  
  # Initiales de l'utilisateur
  def user_initials
    return nil unless user_signed_in? && current_user.name.present?
    
    current_user.name.split.map(&:first).join.upcase
  end
  
  # Vérifier si l'utilisateur peut accéder à une ressource
  def can_access_resource?(resource)
    return false unless user_signed_in?
    
    case resource.class.name
    when 'Commerce'
      current_user.seller_role? && resource.user_id == current_user.id
    when 'Order'
      resource.user_id == current_user.id
    when 'Address'
      resource.user_id == current_user.id
    else
      false
    end
  end
  
  # Filtrer les ressources selon l'utilisateur connecté
  def filter_user_resources(relation)
    return relation.none unless user_signed_in?
    
    relation.where(user_id: current_user.id)
  end
  
  # Réponse JSON standardisée pour les erreurs d'auth
  def auth_error_response(message = 'Authentication required')
    {
      success: false,
      error: message,
      authentication_required: !user_signed_in?,
      redirect_url: new_user_session_path
    }
  end
  
  # Helper pour les actions nécessitant une auth
  def with_authentication
    if user_signed_in?
      yield current_user
    else
      respond_to do |format|
        format.html { redirect_to new_user_session_path }
        format.json { render json: auth_error_response, status: :unauthorized }
      end
    end
  end
  
  # Helper pour les actions nécessitant un rôle spécifique
  def with_role(required_role)
    with_authentication do |user|
      case required_role
      when :seller
        if user.seller_role?
          yield user
        else
          render json: auth_error_response('Seller role required'), status: :forbidden
        end
      when :buyer
        if user.buyerRole?
          yield user
        else
          render json: auth_error_response('Buyer role required'), status: :forbidden
        end
      else
        yield user
      end
    end
  end
end
module AuthHelper
  # Vérifie si l'utilisateur est connecté et retourne ses informations pour JavaScript
  def current_user_js
    if user_signed_in?
      {
        loggedIn: true,
        id: current_user.id,
        name: current_user.name,
        email: current_user.email,
        seller_role: current_user.seller_role || false,
        buyerRole: current_user.buyerRole || false,
        statut_type: current_user.statut_type
      }.to_json.html_safe
    else
      {
        loggedIn: false,
        id: nil,
        name: nil,
        email: nil,
        seller_role: false,
        buyerRole: false,
        statut_type: nil
      }.to_json.html_safe
    end
  end
  
  # Classe CSS conditionnelle pour l'état de connexion
  def auth_class(authenticated_class = '', guest_class = '')
    user_signed_in? ? authenticated_class : guest_class
  end
  
  # Rendu conditionnel basé sur l'authentification
  def render_if_authenticated(&block)
    if user_signed_in?
      capture(&block)
    end
  end
  
  def render_if_guest(&block)
    unless user_signed_in?
      capture(&block)
    end
  end
  
  # Rendu conditionnel basé sur le rôle
  def render_if_seller(&block)
    if user_signed_in? && current_user.seller_role?
      capture(&block)
    end
  end
  
  def render_if_buyer(&block)
    if user_signed_in? && current_user.buyerRole?
      capture(&block)
    end
  end
  
  # Lien conditionnel d'authentification
  def auth_link(authenticated_path, guest_path, options = {})
    path = user_signed_in? ? authenticated_path : guest_path
    link_to path, options do
      yield if block_given?
    end
  end
  
  # Informations utilisateur sécurisées pour JavaScript
  def safe_user_data
    return {} unless user_signed_in?
    
    {
      id: current_user.id,
      name: current_user.name,
      initials: current_user.name&.split&.map(&:first)&.join&.upcase,
      seller_role: !!current_user.seller_role,
      buyer_role: !!current_user.buyerRole,
      statut_type: current_user.statut_type
    }
  end
end
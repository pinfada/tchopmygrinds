class Api::V1::AuthController < Api::V1::BaseController
  # Endpoints d'authentification pour React
  skip_before_action :authenticate_user_from_token!, only: [:login, :register]
  
  # POST /api/v1/auth/login
  def login
    user = User.find_by(email: params[:email])
    
    if user&.valid_password?(params[:password])
      # Devise JWT génère automatiquement le token
      sign_in(user, store: false) # Ne pas stocker en session
      
      render_success({
        user: user_data(user)
      }, message: 'Connexion réussie')
    else
      render_error('Email ou mot de passe incorrect', :unauthorized)
    end
  end
  
  # POST /api/v1/auth/register
  def register
    user = User.new(registration_params)
    
    if user.save
      # Devise JWT génère automatiquement le token
      sign_in(user, store: false)
      
      render_success({
        user: user_data(user)
      }, message: 'Inscription réussie', status: :created)
    else
      render_error(user.errors.full_messages.join(', '))
    end
  end
  
  # POST /api/v1/auth/logout
  def logout
    # Devise JWT révoque automatiquement le token
    sign_out(current_user) if current_user
    render_success(nil, message: 'Déconnexion réussie')
  end
  
  # GET /api/v1/auth/me
  def me
    authenticate_user!
    
    render_success({
      user: user_data(current_user)
    })
  end
  
  # PATCH /api/v1/auth/profile
  def update_profile
    authenticate_user!
    
    if current_user.update(profile_params)
      render_success({
        user: user_data(current_user)
      }, message: 'Profil mis à jour')
    else
      render_error(current_user.errors.full_messages.join(', '))
    end
  end
  
  private
  
  def registration_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :statut_type, :phone)
  end
  
  def profile_params
    params.require(:user).permit(:name, :phone, :avatar)
  end
  
  def user_data(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.statut_type, # itinerant, sedentary, others
      seller_role: user.seller_role,
      buyer_role: user.buyer_role,
      admin: user.admin,
      avatar: user.avatar_url,
      isVerified: true, # Pour simplifier, pas de confirmation pour l'instant
      createdAt: user.created_at.iso8601,
      updatedAt: user.updated_at.iso8601
    }
  end
  
  # JWT généré automatiquement par devise-jwt via les headers de réponse
end
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

  # PATCH /api/v1/auth/password
  # Requires the current password to authorize the change. Devise will then
  # validate the new password (length, presence) and re-issue a JWT on the
  # next /auth/me call since the password change does not by itself revoke
  # existing tokens here.
  def update_password
    authenticate_user!

    current_password = params.dig(:user, :current_password).to_s
    unless current_user.valid_password?(current_password)
      return render_error('Mot de passe actuel incorrect', :unauthorized)
    end

    if current_user.update(password_params)
      render_success({ user: user_data(current_user) }, message: 'Mot de passe mis à jour')
    else
      render_error(current_user.errors.full_messages.join(', '))
    end
  end

  private
  
  ALLOWED_STATUT_TYPES = %w[itinerant sedentary others].freeze

  def registration_params
    # Public marketplace: the user picks itinerant / sedentary / others at sign-up.
    # The frontend sends this as `role`; we map it to the model attribute `statut_type`
    # after a whitelist check so the request cannot inject other enum values.
    # `admin`, `buyer_role`, `seller_role` remain NOT self-assignable — those require
    # an admin or a dedicated approval flow.
    permitted = params.require(:user)
                      .permit(:email, :password, :password_confirmation, :name, :phone, :role)
    role = permitted.delete(:role)
    permitted[:statut_type] = role if ALLOWED_STATUT_TYPES.include?(role)
    permitted
  end
  
  def profile_params
    params.require(:user).permit(:name, :phone, :whatsapp_phone, :avatar)
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end
  
  def user_data(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      whatsapp_phone: user.whatsapp_phone,
      role: user.statut_type, # itinerant, sedentary, others
      seller_role: user.seller_role,
      buyer_role: user.buyer_role,
      admin: user.admin,
      avatar: user.avatar_url,
      isVerified: true, # Pour simplifier, pas de confirmation pour l'instant
      # Merchants need their commerce id client-side to POST products etc.
      # Buyers get an empty array — they have no shops.
      commerces: user.commerces.map { |c| { id: c.id, name: c.name } },
      createdAt: user.created_at.iso8601,
      updatedAt: user.updated_at.iso8601
    }
  end
  
  # JWT généré automatiquement par devise-jwt via les headers de réponse
end
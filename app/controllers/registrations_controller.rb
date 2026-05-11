class RegistrationsController < Devise::RegistrationsController

  private
    # Role and statut_type are NOT user-assignable. They must only be set
    # server-side (admin action, business rule, or invitation flow). Allowing
    # them in public sign-up params lets any visitor self-promote to merchant.
    def sign_up_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end

    def account_update_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation, :current_password)
    end

end
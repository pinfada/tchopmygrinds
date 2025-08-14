require "application_responder"

class ApplicationController < ActionController::Base
	include AuthHelper
	include AuthenticationHelpers if defined?(AuthenticationHelpers)
	
	self.responder = ApplicationResponder
	respond_to :json, :html

	protect_from_forgery with: :exception

	rescue_from CanCan::AccessDenied do |exception|
		Rails.logger.debug "Access denied on #{exception.action} #{exception.subject.inspect}"
		redirect_to main_app.root_path, alert: exception.message
	end
	
	# Callback pour vérifier l'authentification
	def require_authentication!
		unless user_signed_in?
			respond_to do |format|
				format.html { redirect_to new_user_session_path, alert: 'Vous devez être connecté pour accéder à cette page.' }
				format.json { render json: { error: 'Authentication required' }, status: :unauthorized }
			end
		end
	end
	
	# Données utilisateur sécurisées pour JavaScript
	def current_user_json
		safe_user_data
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
	
	# CORS preflight check
	def cors_preflight_check
		if request.method == 'OPTIONS'
			headers['Access-Control-Allow-Origin'] = '*'
			headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, PATCH, DELETE, OPTIONS'
			headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token, X-Requested-With'
			headers['Access-Control-Max-Age'] = '1728000'
			render plain: '', status: 200
		end
	end
	
	# Rendre les helpers d'auth disponibles dans toutes les vues
	helper_method :current_user_json, :user_initials, :can_access_resource?
end

# Concern pour la gestion avancée des erreurs dans les contrôleurs
module EnhancedErrorHandling
  extend ActiveSupport::Concern
  
  included do
    rescue_from StandardError, with: :handle_standard_error
    rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :handle_validation_error
    rescue_from ActionController::ParameterMissing, with: :handle_missing_parameter
    rescue_from CanCan::AccessDenied, with: :handle_access_denied
    rescue_from ArgumentError, with: :handle_argument_error
  end
  
  private
  
  def handle_not_found(exception)
    log_error(exception, 'RECORD_NOT_FOUND')
    render_error("Ressource non trouvée", :not_found, {
      resource: exception.model,
      id: exception.id
    })
  end
  
  def handle_validation_error(exception)
    log_error(exception, 'VALIDATION_ERROR')
    LoggingService.instance.log_validation_error(
      exception.record, 
      exception.record.errors.full_messages,
      { controller: controller_name, action: action_name }
    )
    
    render_validation_errors(exception.record)
  end
  
  def handle_missing_parameter(exception)
    log_error(exception, 'MISSING_PARAMETER')
    render_error("Paramètre requis manquant: #{exception.param}", :bad_request)
  end
  
  def handle_access_denied(exception)
    log_security_event('ACCESS_DENIED', {
      resource: exception.subject.class.name,
      action: exception.action,
      controller: controller_name
    })
    
    render_error("Accès refusé", :forbidden, {
      required_permission: exception.action,
      resource_type: exception.subject.class.name
    })
  end
  
  def handle_argument_error(exception)
    log_error(exception, 'ARGUMENT_ERROR')
    render_error("Argument invalide", :bad_request, {
      message: exception.message
    })
  end
  
  def handle_standard_error(exception)
    log_error(exception, 'UNEXPECTED_ERROR')
    
    # En production, ne pas exposer les détails de l'erreur
    if Rails.env.production?
      render_error("Une erreur interne s'est produite", :internal_server_error)
    else
      render_error(
        "Erreur interne: #{exception.message}", 
        :internal_server_error,
        {
          exception_class: exception.class.name,
          backtrace: exception.backtrace&.first(3)
        }
      )
    end
  end
  
  def log_error(exception, error_type)
    LoggingService.instance.log_api_request(
      controller_name, 
      action_name, 
      params.to_unsafe_h, 
      current_user
    ) do
      raise exception
    end
  end
  
  def log_security_event(event_type, details)
    LoggingService.instance.log_security_event(
      event_type, 
      details, 
      current_user, 
      request
    )
  end
  
  # Méthode helper pour logger les événements métier
  def log_business_event(event_type, data = {})
    LoggingService.instance.log_business_event(event_type, data, current_user)
  end
  
  # Wrapper pour les opérations avec logging automatique
  def with_logging(&block)
    LoggingService.instance.log_api_request(
      controller_name, 
      action_name, 
      params.to_unsafe_h, 
      current_user,
      &block
    )
  end
end
# Service de logging structuré pour l'application
class LoggingService
  include Singleton
  
  def initialize
    @logger = Rails.logger
  end
  
  # Log d'événements API avec contexte enrichi
  def log_api_request(controller, action, params, user = nil, &block)
    request_id = SecureRandom.hex(8)
    start_time = Time.current
    
    context = {
      request_id: request_id,
      controller: controller,
      action: action,
      user_id: user&.id,
      user_role: user&.statut_type,
      params: sanitize_params(params),
      timestamp: start_time.iso8601
    }
    
    @logger.info("API_REQUEST_START", context)
    
    begin
      result = block.call if block_given?
      
      end_time = Time.current
      duration = ((end_time - start_time) * 1000).round(2)
      
      @logger.info("API_REQUEST_SUCCESS", context.merge(
        duration_ms: duration,
        completed_at: end_time.iso8601
      ))
      
      result
    rescue => e
      end_time = Time.current
      duration = ((end_time - start_time) * 1000).round(2)
      
      error_context = context.merge(
        error_class: e.class.name,
        error_message: e.message,
        error_backtrace: e.backtrace&.first(5),
        duration_ms: duration,
        failed_at: end_time.iso8601
      )
      
      @logger.error("API_REQUEST_ERROR", error_context)
      
      # Re-lancer l'erreur pour que le contrôleur puisse la gérer
      raise e
    end
  end
  
  # Log d'événements métier
  def log_business_event(event_type, data = {}, user = nil)
    context = {
      event_type: event_type,
      data: data,
      user_id: user&.id,
      timestamp: Time.current.iso8601
    }
    
    @logger.info("BUSINESS_EVENT", context)
  end
  
  # Log d'erreurs de validation
  def log_validation_error(model, errors, context = {})
    @logger.warn("VALIDATION_ERROR", {
      model: model.class.name,
      model_id: model.id,
      errors: errors,
      context: context,
      timestamp: Time.current.iso8601
    })
  end
  
  # Log des performances de géolocalisation
  def log_geolocation_performance(operation, lat, lng, radius, results_count, duration_ms)
    @logger.info("GEOLOCATION_PERFORMANCE", {
      operation: operation,
      coordinates: { lat: lat, lng: lng },
      radius_km: radius,
      results_count: results_count,
      duration_ms: duration_ms,
      timestamp: Time.current.iso8601
    })
  end
  
  # Log des événements de sécurité
  def log_security_event(event_type, details, user = nil, request = nil)
    context = {
      event_type: event_type,
      details: details,
      user_id: user&.id,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent,
      timestamp: Time.current.iso8601
    }
    
    @logger.warn("SECURITY_EVENT", context)
  end
  
  private
  
  # Nettoie les paramètres sensibles pour le logging
  def sanitize_params(params)
    return {} unless params.is_a?(Hash)
    
    sensitive_keys = %w[password password_confirmation token secret key]
    
    params.deep_transform_values do |value|
      # Si la clé contient un mot sensible, on masque la valeur
      if params.keys.any? { |k| sensitive_keys.any? { |s| k.to_s.downcase.include?(s) } }
        '[FILTERED]'
      else
        value
      end
    end
  end
end
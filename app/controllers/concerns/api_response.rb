# Concern pour standardiser les réponses API
module ApiResponse
  extend ActiveSupport::Concern

  private

  def render_success(data = nil, message = nil, status = :ok, meta = {})
    response_data = {
      success: true,
      data: data,
      meta: {
        timestamp: Time.current.iso8601,
        **meta
      }
    }
    
    response_data[:message] = message if message.present?
    
    render json: response_data, status: status
  end

  def render_error(message, status = :bad_request, errors = nil)
    response_data = {
      success: false,
      error: {
        message: message,
        code: status,
        timestamp: Time.current.iso8601
      }
    }
    
    response_data[:error][:details] = errors if errors.present?
    
    render json: response_data, status: status
  end

  def render_validation_errors(record)
    render_error(
      "Validation failed",
      :unprocessable_entity,
      record.errors.full_messages
    )
  end

  def render_not_found(resource = "Resource")
    render_error("#{resource} not found", :not_found)
  end

  def render_unauthorized(message = "Unauthorized access")
    render_error(message, :unauthorized)
  end

  def render_paginated(collection, serializer = nil, meta = {})
    # Kaminari pagination info
    pagination_meta = if collection.respond_to?(:current_page)
      {
        pagination: {
          current_page: collection.current_page,
          per_page: collection.limit_value,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          next_page: collection.next_page,
          prev_page: collection.prev_page
        }
      }
    else
      {}
    end

    data = if serializer
      collection.map { |item| serializer.call(item) }
    else
      collection.as_json
    end

    render_success(data, nil, :ok, pagination_meta.merge(meta))
  end
end
class Api::V1::UtilsController < Api::V1::BaseController
  # GET /api/v1/utils/geocode
  def geocode
    address = params[:address]
    return render_error('Paramètre address requis') if address.blank?
    
    begin
      result = Geocoder.search(address).first
      
      if result
        render_success({
          latitude: result.latitude,
          longitude: result.longitude,
          address: result.address,
          country: result.country,
          city: result.city
        })
      else
        render_error('Adresse non trouvée', :not_found)
      end
    rescue => e
      Rails.logger.error "Geocoding error: #{e.message}"
      render_error('Erreur lors de la géolocalisation')
    end
  end
  
  # GET /api/v1/utils/reverse-geocode
  def reverse_geocode
    latitude = params[:latitude]&.to_f
    longitude = params[:longitude]&.to_f
    
    unless latitude && longitude
      return render_error('Paramètres latitude et longitude requis')
    end
    
    begin
      result = Geocoder.search([latitude, longitude]).first
      
      if result
        render_success({
          address: result.address,
          city: result.city,
          country: result.country,
          postal_code: result.postal_code,
          coordinates: {
            latitude: latitude,
            longitude: longitude
          }
        })
      else
        render_error('Coordonnées non trouvées', :not_found)
      end
    rescue => e
      Rails.logger.error "Reverse geocoding error: #{e.message}"
      render_error('Erreur lors de la géolocalisation inverse')
    end
  end
end
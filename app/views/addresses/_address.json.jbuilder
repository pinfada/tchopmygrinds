json.extract! address, :id, :address1, :address2, :country, :city, :zipcode, :state, :latitude, :longitude, :created_at, :updated_at
json.url address_url(address, format: :json)

json.extract! commerce, :id, :name, :adress1, :adress2, :details, :postal, :country, :latitude, :longitude, :created_at, :updated_at, :city, :user_id
json.url commerce_url(commerce, format: :json)
json.extract! order, :id, :orderdate, :requiredate, :shippedate, :status, :user_id, :payment_address_id, :delivery_address_id, :created_at, :updated_at
json.url order_url(order, format: :json)
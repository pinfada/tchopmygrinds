json.extract! product, :id, :name, :quantityperunit, :unitprice, :unitsinstock, :unitsonorder, :commerce_id, :created_at, :updated_at
json.url product_url(product, format: :json)
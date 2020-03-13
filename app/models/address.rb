class Address < ApplicationRecord
	validates_presence_of :address1, :address2, :city, :country, :zipcode, :state, :latitude, :longitude

    belongs_to :user
	has_many :orders, :foreign_key => 'payment_address_id'
	has_many :orders, :foreign_key => 'delivery_address_id'

	#reverse_geocoded_by :latitude, :longitude

	reverse_geocoded_by :latitude, :longitude do |obj,results|
		if geo = results.first
		  obj.zipcode = geo.postal_code
		  obj.city = geo.city
		  obj.country = geo.country
		  obj.address1 = geo.address
		  obj.state = geo.state
		end
	end
	before_validation :reverse_geocode,
	:if => lambda{ |obj| obj.longitude_changed? }

	#accepts_nested_attributes_for :users
	
end

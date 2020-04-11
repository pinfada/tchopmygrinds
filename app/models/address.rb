class Address < ApplicationRecord
	validates_presence_of :latitude, :longitude
    belongs_to :user
	has_many :orders, :foreign_key => 'payment_address_id'
	has_many :orders, :foreign_key => 'delivery_address_id'

	#reverse_geocoded_by :latitude, :longitude

	#geocoded_by :full_address
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

	#before_validation :reverse_geocode,
	#:if => lambda{ |obj| obj.longitude_changed? }

	#after_validation :geocode, if: ->(obj){ obj.address1.present? and obj.address1_changed? }
	after_validation :reverse_geocode, unless: ->(obj) { obj.address1.present? and obj.address1_changed? }
	#before_validation :reverse_geocode,
    #    if: ->(obj){ obj.latitude.present? and obj.latitude_changed? and obj.longitude.present? and obj.longitude_changed? }
	
	#accepts_nested_attributes_for :users

end

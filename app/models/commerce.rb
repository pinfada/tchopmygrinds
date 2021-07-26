class Commerce < ApplicationRecord
	validates :name, presence: true, uniqueness: true, on: :create
	validates :name, length: {minimum: 2}
	before_save { self.name = name.downcase }

	belongs_to :user
	has_many :categorizations
	has_many :products, -> { distinct }, through: :categorizations
	#geocoded_by :adress1
	#after_validation :geocode, :if => :adress1_changed?

	reverse_geocoded_by :latitude, :longitude do |obj,results|
		if geo = results.first
		  obj.postal = geo.postal_code
		  obj.city = geo.city
		  obj.country = geo.country
		  obj.adress1 = geo.address
		end
	end

	after_validation :reverse_geocode, unless: ->(obj) { obj.adress1.present? and obj.adress1_changed? }

end

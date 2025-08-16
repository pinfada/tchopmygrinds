class Commerce < ApplicationRecord
	validates :name, presence: true, uniqueness: true, on: :create
	validates :name, length: {minimum: 2}
	before_save { self.name = name.downcase }

	belongs_to :user
	has_many :categorizations
	has_many :products, -> { distinct }, through: :categorizations
	has_many :ratings, as: :rateable, dependent: :destroy
	
	# Configuration Geocoder pour la géolocalisation  
	geocoded_by :adress1
	after_validation :geocode, if: :adress1_changed?

	reverse_geocoded_by :latitude, :longitude do |obj,results|
		if geo = results.first
		  obj.postal = geo.postal_code
		  obj.city = geo.city
		  obj.country = geo.country
		  obj.adress1 = geo.address
		end
	end

	after_validation :reverse_geocode, unless: ->(obj) { obj.adress1.present? and obj.adress1_changed? }

	# Méthodes pour les évaluations
	def average_rating
		return 0 if ratings.public_ratings.empty?
		ratings.public_ratings.average(:rating).to_f.round(1)
	end

	def ratings_count
		ratings.public_ratings.count
	end

	def verified_ratings_count
		ratings.verified.public_ratings.count
	end

	def ratings_distribution
		ratings.public_ratings.group(:rating).count
	end

	def update_average_rating
		# Cette méthode peut être utilisée pour mettre à jour un champ cached si nécessaire
		# update_column(:cached_rating, average_rating)
	end

end

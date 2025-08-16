class Product < ApplicationRecord
    validates :name, presence: true, uniqueness: true, on: :create
    validates :name, length: {minimum: 2}
    validates :quantityperunit, presence: true
    validates :unitprice, presence: true
    validates :unitprice, :format => { :with => /\A\d+(?:\.\d{0,2})?\z/ }, numericality: { greater_than: 0 }
    validates :unitsinstock, presence: true
    validates :unitsonorder, presence: true
    
    # Direct association for API compatibility
    belongs_to :commerce, optional: true
    
    # Many-to-many association for legacy compatibility
    has_many :categorizations
    has_many :orderdetails, dependent: :destroy
    has_many :product_interests, dependent: :destroy
    has_many :ratings, as: :rateable, dependent: :destroy
    has_many :commerces_through_categorizations, -> { distinct }, through: :categorizations, source: :commerce
    has_many :orders, -> { distinct }, through: :orderdetails
    accepts_nested_attributes_for :commerces_through_categorizations, :orders

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
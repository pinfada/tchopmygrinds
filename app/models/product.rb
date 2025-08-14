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
    has_many :commerces_through_categorizations, -> { distinct }, through: :categorizations, source: :commerce
    has_many :orders, -> { distinct }, through: :orderdetails
    accepts_nested_attributes_for :commerces_through_categorizations, :orders
end
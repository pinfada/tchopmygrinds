class Product < ApplicationRecord
    validates :name, presence: true, uniqueness: true, on: :create
    validates :name, length: {minimum: 2}
    validates :quantityperunit, presence: true
    validates :unitprice, presence: true
    validates :unitprice, :format => { :with => /\A\d+(?:\.\d{0,2})?\z/ }, numericality: { greater_than: 0 }
    validates :unitsinstock, presence: true
    validates :unitsonorder, presence: true
    
    has_many :categorizations
    has_many :orderdetails
    has_many :commerces, -> { distinct }, through: :categorizations
    has_many :orders, -> { distinct }, through: :orderdetails
    accepts_nested_attributes_for :commerces, :orders
end
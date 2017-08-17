class Product < ApplicationRecord
    has_many :categorizations
    has_many :commerces, -> { distinct }, through: :categorizations
end
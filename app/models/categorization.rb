class Categorization < ApplicationRecord
    belongs_to :product
    belongs_to :commerce
	validates :product_id,   presence: true
	validates :commerce_id,   presence: true
end
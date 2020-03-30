class Orderdetail < ApplicationRecord
  belongs_to :product
  belongs_to :order
  validates :product_id, presence: true
  validates :order_id, presence: true
  accepts_nested_attributes_for :product, :order
end

class Orderdetail < ApplicationRecord
  belongs_to :product
  belongs_to :order
  accepts_nested_attributes_for :product, :order
end

class Orderdetail < ApplicationRecord
  belongs_to :product, dependent: :destroy
  belongs_to :order, dependent: :destroy
  validates :product_id, presence: true
  validates :order_id, presence: true
  #validates :unitprice, :format => { :with => /\A\d+(?:\.\d{0,2})?\z/ }, numericality: { greater_than: 0 }
  accepts_nested_attributes_for :product, :order
end

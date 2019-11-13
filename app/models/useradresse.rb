class Useradresse < ApplicationRecord
    belongs_to :user
	has_many :orders, :foreign_key => 'payment_address_id'
	has_many :orders, :foreign_key => 'delivery_address_id'
	validates_presence_of :address_1, :address_2, :city, :country, :zipcode, :state
end

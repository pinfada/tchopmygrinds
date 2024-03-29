class Order < ApplicationRecord
  enum status: { Waiting: 0, Accepted: 1, In_Progress: 2, Shipped: 3, Delivered: 4, Completed: 5, Cancelled: 6 }
  belongs_to :user
	belongs_to :address, :foreign_key => 'payment_address_id'
	belongs_to :address, :foreign_key => 'delivery_address_id'
  has_many :orderdetails, dependent: :destroy
  has_many :products, -> { distinct }, through: :orderdetails
  after_update :change_status
  validates :user_id, presence: true

	private

  def change_status
      if self.status_changed?
      	@order_id = self.id
        UserMailer.change_status_mail(user, self.status, @order_id).deliver_now
      end
  end
end

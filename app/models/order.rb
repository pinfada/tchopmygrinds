class Order < ApplicationRecord
  enum status: { Accepted: 0, In_Progress: 1, Shipped: 2, Delivered: 3 , Completed: 4, Cancelled: 5 }
  belongs_to :user
	belongs_to :useradresse, :foreign_key => 'payment_address_id'
	belongs_to :useradresse, :foreign_key => 'delivery_address_id'
  has_many :orderdetails
  has_many :products, -> { distinct }, through: :orderdetails
  after_update :change_status

	private

  def change_status
      if self.status_changed?
      	@order_id = self.id
        UserMailer.change_status_mail(user, self.status, @order_id).deliver_now
      end
  end
end

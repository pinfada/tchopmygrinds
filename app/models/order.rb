class Order < ApplicationRecord
  enum status: { Waiting: 0, Accepted: 1, In_Progress: 2, Shipped: 3, Delivered: 4, Completed: 5, Cancelled: 6 }
  belongs_to :user
  # Optional address relationships for backward compatibility
	belongs_to :payment_address, class_name: 'Address', foreign_key: 'payment_address_id', optional: true
	belongs_to :delivery_address_obj, class_name: 'Address', foreign_key: 'delivery_address_id', optional: true
  has_many :orderdetails, dependent: :destroy
  has_many :products, -> { distinct }, through: :orderdetails
  after_update :change_status
  validates :user_id, presence: true

  # Méthode pour vérifier si une commande peut être évaluée pour un objet spécifique
  def can_be_rated_for?(rateable)
    return false unless ['Delivered', 'Completed'].include?(status)
    
    case rateable.class.name
    when 'Commerce'
      # Vérifier si la commande contient des produits de ce commerce
      orderdetails.joins(:product).where(products: { commerce_id: rateable.id }).exists?
    when 'Product'
      # Vérifier si la commande contient ce produit
      orderdetails.where(product_id: rateable.id).exists?
    else
      false
    end
  end

	private

  def change_status
      if self.status_changed?
      	@order_id = self.id
        UserMailer.change_status_mail(user, self.status, @order_id).deliver_now
      end
  end
end

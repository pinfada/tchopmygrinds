class Order < ApplicationRecord
  enum status: { Waiting: 0, Accepted: 1, In_Progress: 2, Shipped: 3, Delivered: 4, Completed: 5, Cancelled: 6 }
  belongs_to :user
  # Optional address relationships for backward compatibility
	belongs_to :payment_address, class_name: 'Address', foreign_key: 'payment_address_id', optional: true
	belongs_to :delivery_address_obj, class_name: 'Address', foreign_key: 'delivery_address_id', optional: true
  has_many :orderdetails, dependent: :destroy
  has_many :products, -> { distinct }, through: :orderdetails

  # Fires AFTER the surrounding transaction commits, so a SendGrid outage can
  # no longer roll back an order update. Uses deliver_later to push the work
  # off the request thread entirely.
  after_commit :notify_status_change, on: :update, if: :saved_change_to_status?

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

  def notify_status_change
    UserMailer.change_status_mail(user, status, id).deliver_later
  end
end

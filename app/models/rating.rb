class Rating < ApplicationRecord
  belongs_to :user
  belongs_to :rateable, polymorphic: true
  belongs_to :order, optional: true
  belongs_to :moderator, class_name: 'User', foreign_key: 'moderated_by', optional: true

  # Enums pour le statut de modération
  enum status: { 
    pending: 0,
    approved: 1,
    rejected: 2
  }

  # Validations
  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 1000 }
  validates :user_id, uniqueness: { scope: [:rateable_type, :rateable_id], 
                                   message: "Vous avez déjà évalué cet élément" }

  # Scopes
  scope :verified, -> { where(verified: true) }
  scope :moderated, -> { where(moderated: true) }
  scope :public_ratings, -> { where(status: 'approved') }
  scope :by_rating, ->(rating) { where(rating: rating) }
  scope :recent, -> { order(created_at: :desc) }
  scope :needs_moderation, -> { where(status: 'pending') }

  # Callbacks
  before_save :check_verification
  after_create :update_rateable_rating
  after_update :update_rateable_rating
  after_destroy :update_rateable_rating

  private

  def check_verification
    # Vérifier si l'utilisateur a acheté le produit/service
    if order_id.present?
      self.verified = true
    elsif rateable_type == 'Commerce' && user.orders.joins(:orderdetails, :products)
                                             .where(products: { commerce_id: rateable_id })
                                             .where(status: ['Delivered', 'Completed']).exists?
      self.verified = true
    elsif rateable_type == 'Product' && user.orders.joins(:orderdetails)
                                             .where(orderdetails: { product_id: rateable_id })
                                             .where(status: ['Delivered', 'Completed']).exists?
      self.verified = true
    else
      self.verified = false
    end
  end

  def update_rateable_rating
    # Mettre à jour la note moyenne de l'objet évalué
    if rateable.respond_to?(:update_average_rating)
      rateable.update_average_rating
    end
  end
end

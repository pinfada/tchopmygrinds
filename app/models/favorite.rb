class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :commerce

  validates :user_id, uniqueness: { scope: :commerce_id, message: 'a déjà ce commerce en favori' }
end

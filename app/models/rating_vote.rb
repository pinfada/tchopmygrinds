# Tracks "this rating was helpful" votes. The (user_id, rating_id) pair is
# unique at the DB level, so any repeat POST to mark_helpful is a no-op.
# The Rating#helpful_count cache column is recomputed from this table.
class RatingVote < ApplicationRecord
  belongs_to :rating
  belongs_to :user

  validates :user_id, uniqueness: { scope: :rating_id }
end

require 'rails_helper'

# Regression spec for the helpful_count anti-fraud mechanism (Lot 2 / C13).
# Before C13, helpful_count was a free-floating counter that any user could
# inflate by POSTing repeatedly. The rating_votes unique index makes the
# operation idempotent at the DB level.
RSpec.describe RatingVote, type: :model do
  let!(:author) do
    User.create!(email: "author.#{SecureRandom.hex(4)}@example.test",
                 password: "Password123!", name: "Author")
  end
  let!(:voter) do
    User.create!(email: "voter.#{SecureRandom.hex(4)}@example.test",
                 password: "Password123!", name: "Voter")
  end
  let!(:merchant) do
    User.create!(email: "merch.#{SecureRandom.hex(4)}@example.test",
                 password: "Password123!", name: "Merch")
  end
  let!(:commerce) { Commerce.create!(name: "Shop", user: merchant) }
  let!(:rating) do
    Rating.create!(
      user: author,
      rateable: commerce,
      rating: 5,
      comment: "Great",
      helpful_count: 0
    )
  end

  it 'allows a voter to vote at most once on a given rating' do
    RatingVote.create!(rating: rating, user: voter)

    second_vote = RatingVote.new(rating: rating, user: voter)
    expect(second_vote).not_to be_valid
    expect(second_vote.errors[:user_id]).to be_present
  end

  it 'enforces uniqueness at the database level even if validation is skipped' do
    RatingVote.create!(rating: rating, user: voter)

    expect {
      duplicate = RatingVote.new(rating: rating, user: voter)
      duplicate.save(validate: false)
    }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it 'allows different voters to each vote once' do
    other_voter = User.create!(email: "v2.#{SecureRandom.hex(4)}@example.test",
                               password: "Password123!", name: "V2")

    RatingVote.create!(rating: rating, user: voter)
    RatingVote.create!(rating: rating, user: other_voter)

    expect(rating.rating_votes.count).to eq(2)
  end
end

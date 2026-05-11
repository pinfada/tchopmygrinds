require 'rails_helper'

RSpec.describe Rating, type: :model do
  let(:author) { FactoryBot.create(:user) }
  let(:merchant) { FactoryBot.create(:user, :sedentary) }
  let(:commerce) { FactoryBot.create(:commerce, user: merchant) }

  describe 'uniqueness' do
    it 'prevents a user from rating the same commerce twice' do
      Rating.create!(user: author, rateable: commerce, rating: 4, comment: "ok")

      duplicate = Rating.new(user: author, rateable: commerce, rating: 5, comment: "again")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id].join).to match(/déjà évalué/)
    end

    it 'allows the same user to rate a different rateable type' do
      product = FactoryBot.create(:product, commerce: commerce)

      Rating.create!(user: author, rateable: commerce, rating: 4, comment: "ok")
      product_rating = Rating.new(user: author, rateable: product, rating: 4, comment: "ok")

      expect(product_rating).to be_valid
    end
  end

  describe 'validation of rating range' do
    it 'rejects a rating below 1' do
      r = Rating.new(user: author, rateable: commerce, rating: 0)
      expect(r).not_to be_valid
      expect(r.errors[:rating]).to be_present
    end

    it 'rejects a rating above 5' do
      r = Rating.new(user: author, rateable: commerce, rating: 6)
      expect(r).not_to be_valid
    end
  end
end

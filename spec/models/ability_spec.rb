require 'rails_helper'

# Regression spec for the Ability authorization rules (Lot 2 / C8).
# Before C8, `can :manage, Order` had no condition hash, so any seller could
# manage any other seller's records. Now each rule is scoped by user_id.
RSpec.describe Ability, type: :model do
  let(:alice) { FactoryBot.create(:user, :buyer) }
  let(:bob)   { FactoryBot.create(:user, :buyer) }
  let(:admin) { FactoryBot.create(:user, :admin) }

  let(:alice_order) { Order.create!(user: alice, status: :Waiting) }
  let(:bob_order)   { Order.create!(user: bob,   status: :Waiting) }

  describe 'a buyer' do
    subject(:ability) { Ability.new(alice) }

    it 'can manage their own order' do
      expect(ability.can?(:manage, alice_order)).to be true
    end

    it 'cannot manage another buyer\'s order' do
      expect(ability.can?(:manage, bob_order)).to be false
    end

    it 'cannot manage another buyer\'s order even for read' do
      expect(ability.can?(:read, bob_order)).to be false
    end
  end

  describe 'an admin' do
    subject(:ability) { Ability.new(admin) }

    it 'can manage any order' do
      expect(ability.can?(:manage, alice_order)).to be true
      expect(ability.can?(:manage, bob_order)).to be true
    end
  end

  describe 'a guest (nil user)' do
    subject(:ability) { Ability.new(nil) }

    it 'has no abilities at all' do
      expect(ability.can?(:read, alice_order)).to be false
      expect(ability.can?(:manage, alice_order)).to be false
    end
  end

  describe 'commerce ownership for sellers' do
    let(:seller_a) { FactoryBot.create(:user, :sedentary) }
    let(:seller_b) { FactoryBot.create(:user, :sedentary) }
    let(:shop_a)   { FactoryBot.create(:commerce, user: seller_a) }

    it 'lets a seller manage their own commerce' do
      expect(Ability.new(seller_a).can?(:manage, shop_a)).to be true
    end

    it 'forbids a seller from managing another seller\'s commerce' do
      expect(Ability.new(seller_b).can?(:manage, shop_a)).to be false
    end
  end
end

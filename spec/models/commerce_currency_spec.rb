require 'rails_helper'

RSpec.describe Commerce, 'currency' do
  let(:user) { create(:user, :sedentary) }

  it 'defaults to EUR when no currency is provided' do
    c = user.commerces.build(name: "shop-#{SecureRandom.hex(2)}", adress1: '1 rue Test')
    expect(c.currency).to eq('EUR')
  end

  it 'accepts a code that exists in the currencies table' do
    c = user.commerces.build(name: "shop-#{SecureRandom.hex(2)}", currency: 'XAF', adress1: '1 rue Test')
    expect(c).to be_valid
  end

  it 'rejects a code missing from the currencies table' do
    c = user.commerces.build(name: "shop-#{SecureRandom.hex(2)}", currency: 'ZZZ', adress1: '1 rue Test')
    expect(c).to be_invalid
    expect(c.errors[:currency].first).to include('non supporté')
  end

  it 'picks up newly added currencies without code change' do
    # Real demonstration of the single-source-of-truth: insert a brand new
    # code at runtime, the validator accepts it on the next save.
    Currency.create!(code: 'TST', label: 'Test', decimals: 0, suffix: 'T')

    c = user.commerces.build(name: "shop-#{SecureRandom.hex(2)}", currency: 'TST', adress1: '1 rue Test')
    expect(c).to be_valid
  ensure
    Currency.find_by(code: 'TST')&.destroy
  end
end

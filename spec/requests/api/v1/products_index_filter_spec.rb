require 'rails_helper'

# Products are linked to Commerces through the categorizations join table (the
# direct products.commerce_id column is null for seed data). Filtering with
# `where(commerce_id: ...)` therefore returns 0 rows. The index must filter
# through the categorizations relation so /products?commerce_id=N matches
# what /commerces/N/products returns.
RSpec.describe 'GET /api/v1/products?commerce_id=N filters via categorizations', type: :request do
  let(:merchant) { FactoryBot.create(:user, :sedentary) }
  let(:shop_a) { FactoryBot.create(:commerce, user: merchant) }
  let(:shop_b) { FactoryBot.create(:commerce, user: merchant) }

  let!(:apple_in_shop_a) do
    p = FactoryBot.create(:product)
    shop_a.products << p
    p
  end

  let!(:banana_in_shop_b) do
    p = FactoryBot.create(:product)
    shop_b.products << p
    p
  end

  it 'returns only shop_a products when filtering by shop_a.id' do
    get "/api/v1/products?commerce_id=#{shop_a.id}"
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    ids = body.dig('data', 'products').map { |p| p['id'] }
    expect(ids).to include(apple_in_shop_a.id)
    expect(ids).not_to include(banana_in_shop_b.id)
  end

  it 'returns shop_b products when filtering by shop_b.id' do
    get "/api/v1/products?commerce_id=#{shop_b.id}"
    body = JSON.parse(response.body)
    ids = body.dig('data', 'products').map { |p| p['id'] }
    expect(ids).to include(banana_in_shop_b.id)
    expect(ids).not_to include(apple_in_shop_a.id)
  end

  it 'returns 0 when filtering by a commerce that has no products' do
    empty_shop = FactoryBot.create(:commerce, user: merchant)
    get "/api/v1/products?commerce_id=#{empty_shop.id}"
    body = JSON.parse(response.body)
    expect(body.dig('data', 'products')).to eq([])
  end
end

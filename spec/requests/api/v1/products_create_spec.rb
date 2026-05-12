require 'rails_helper'

RSpec.describe 'POST /api/v1/products', type: :request do
  let(:merchant) { FactoryBot.create(:user, :sedentary) }
  let(:commerce) { FactoryBot.create(:commerce, user: merchant) }

  # Mint a real JWT for the merchant via the login endpoint so the spec
  # exercises the same auth path used by the React frontend.
  def auth_headers_for(user)
    post '/api/v1/auth/login', params: { email: user.email, password: 'Password123!' }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  let(:valid_payload) do
    {
      commerce_id: commerce.id,
      product: {
        name: "Test mango #{SecureRandom.hex(2)}",
        description: 'Sweet tropical fruit',
        price: 4.50,
        unit: 'kg',
        category: 'Fruits',
        stock: 25,
        available: true
      }
    }
  end

  context 'when the request is unauthenticated' do
    it 'returns 401' do
      post '/api/v1/products', params: valid_payload, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context 'when the merchant owns the commerce' do
    it 'creates a product mapped onto the real DB columns' do
      headers = auth_headers_for(merchant)

      expect {
        post '/api/v1/products', params: valid_payload, headers: headers, as: :json
      }.to change(Product, :count).by(1)

      expect(response).to have_http_status(:created)
      created = Product.order(:created_at).last
      expect(created.name).to eq(valid_payload[:product][:name])
      expect(created.unitprice.to_f).to eq(4.50)
      expect(created.quantityperunit).to eq('kg')
      expect(created.unitsinstock).to eq(25)
      expect(created.category).to eq('Fruits')
      # Product↔Commerce is wired through the categorizations join table by convention
      # (see Commerce#products has_many :through). The direct commerce_id column is
      # not populated in seed data either.
      expect(created.commerces_through_categorizations).to include(commerce)

      body = JSON.parse(response.body)
      expect(body.dig('data', 'product', 'price').to_f).to eq(4.50)
      expect(body.dig('data', 'product', 'unit')).to eq('kg')
      expect(body.dig('data', 'product', 'stock')).to eq(25)
    end

    it 'rejects an empty product body with 422' do
      headers = auth_headers_for(merchant)
      post '/api/v1/products',
           params: { commerce_id: commerce.id, product: { name: 'orphan' } },
           headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  context 'when posting to a commerce the user does not own' do
    let(:other_merchant) { FactoryBot.create(:user, :sedentary) }
    let(:other_commerce) { FactoryBot.create(:commerce, user: other_merchant) }

    it 'returns 404 (the merchant only sees their own commerces)' do
      headers = auth_headers_for(merchant)
      post '/api/v1/products',
           params: valid_payload.merge(commerce_id: other_commerce.id),
           headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end

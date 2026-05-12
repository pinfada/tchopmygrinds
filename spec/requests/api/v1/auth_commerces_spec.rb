require 'rails_helper'

# Frontend needs the merchant's commerce_id to POST products. Before this fix,
# VendorDashboardPage tried fetchCommerceById(user.id), which 404s because user.id
# is not a commerce id. Auth payloads now include the user's commerces so the
# frontend can derive the right id without a separate roundtrip.
RSpec.describe 'auth payloads include commerces', type: :request do
  let(:merchant) { FactoryBot.create(:user, :sedentary) }
  let!(:shop) { FactoryBot.create(:commerce, user: merchant, name: 'My Shop') }
  let(:buyer) { FactoryBot.create(:user, :buyer) }

  describe 'POST /api/v1/auth/login' do
    it "returns the merchant's commerces in the user payload" do
      post '/api/v1/auth/login',
           params: { email: merchant.email, password: 'Password123!' },
           as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      commerces = body.dig('data', 'user', 'commerces')
      expect(commerces).to be_an(Array)
      # Commerce#name is downcased by a model callback; compare case-insensitively.
      expect(commerces.first['id']).to eq(shop.id)
      expect(commerces.first['name'].downcase).to eq('my shop')
    end

    it 'returns an empty array for buyers (no shop)' do
      post '/api/v1/auth/login',
           params: { email: buyer.email, password: 'Password123!' },
           as: :json
      body = JSON.parse(response.body)
      expect(body.dig('data', 'user', 'commerces')).to eq([])
    end
  end

  describe 'GET /api/v1/auth/me' do
    it "returns the merchant's commerces" do
      post '/api/v1/auth/login',
           params: { email: merchant.email, password: 'Password123!' },
           as: :json
      auth = response.headers['Authorization']

      get '/api/v1/auth/me', headers: { 'Authorization' => auth }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig('data', 'user', 'commerces').map { |c| c['id'] }).to include(shop.id)
    end
  end
end

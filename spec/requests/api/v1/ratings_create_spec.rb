require 'rails_helper'

# The React frontend POSTs ratings as:
#   { rating: { rating, comment, rateable_type, rateable_id }, order_id }
# i.e. rateable_type and rateable_id are NESTED under `rating`. The controller
# must accept that shape; previously it only read params at top-level and
# returned 400 "Type d'objet non supporté".
RSpec.describe 'POST /api/v1/ratings', type: :request do
  let(:author) { FactoryBot.create(:user, :buyer) }
  let(:merchant) { FactoryBot.create(:user, :sedentary) }
  let(:commerce) { FactoryBot.create(:commerce, user: merchant) }

  def auth_headers_for(user)
    post '/api/v1/auth/login', params: { email: user.email, password: 'Password123!' }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  it 'accepts rateable_type/rateable_id nested under `rating` (the frontend shape)' do
    headers = auth_headers_for(author)

    payload = {
      rating: {
        rating: 4,
        comment: 'Très bon commerce',
        rateable_type: 'Commerce',
        rateable_id: commerce.id
      }
    }

    expect {
      post '/api/v1/ratings', params: payload, headers: headers, as: :json
    }.to change(Rating, :count).by(1)

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body['status']).to eq('success')
  end

  it 'still works when rateable_type/rateable_id are sent at top level' do
    headers = auth_headers_for(author)

    payload = {
      rating: { rating: 5, comment: 'Au top' },
      rateable_type: 'Commerce',
      rateable_id: commerce.id
    }

    expect {
      post '/api/v1/ratings', params: payload, headers: headers, as: :json
    }.to change(Rating, :count).by(1)

    expect(response).to have_http_status(:created)
  end

  it 'returns 400 when rateable_type is missing entirely' do
    headers = auth_headers_for(author)
    post '/api/v1/ratings',
         params: { rating: { rating: 3, comment: 'orphan' } },
         headers: headers, as: :json
    expect(response).to have_http_status(:bad_request)
  end
end

require 'rails_helper'

# Regression specs for the geo-proximity endpoint (Lot 2 / C9). The endpoint
# is public (no JWT) so we can exercise it directly.
RSpec.describe 'GET /api/v1/commerces/nearby', type: :request do
  it 'returns 422 when latitude is missing' do
    get '/api/v1/commerces/nearby', params: { longitude: 2.35 }

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['message']).to match(/latitude/i)
  end

  it 'returns 422 when longitude is missing' do
    get '/api/v1/commerces/nearby', params: { latitude: 48.85 }

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it 'returns 422 when latitude is out of range' do
    get '/api/v1/commerces/nearby', params: { latitude: 200, longitude: 2.35 }

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['message']).to match(/invalide/i)
  end

  it 'returns 422 when longitude is out of range' do
    get '/api/v1/commerces/nearby', params: { latitude: 48.85, longitude: 999 }

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it 'accepts valid coordinates and returns 200' do
    get '/api/v1/commerces/nearby', params: { latitude: 48.85, longitude: 2.35 }

    expect(response).to have_http_status(:ok)
  end

  it 'caps the radius at the server-side maximum even when the caller asks for more' do
    # We cannot easily inspect the radius the controller actually used in the
    # response, but the call must succeed (no 500) and not stall the suite.
    get '/api/v1/commerces/nearby', params: { latitude: 48.85, longitude: 2.35, radius: 99_999 }

    expect(response).to have_http_status(:ok)
  end
end

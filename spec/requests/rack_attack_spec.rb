require 'rails_helper'

# Regression: rate limits must actually fire when exceeded. We re-enable
# Rack::Attack just for this spec because the initializer disables it in
# the test environment to keep the rest of the suite hermetic.
RSpec.describe 'Rack::Attack rate limiting', type: :request do
  around do |example|
    previous_enabled = Rack::Attack.enabled
    Rack::Attack.enabled = true
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    example.run
    Rack::Attack.enabled = previous_enabled
  end

  it 'returns 429 after the per-minute login limit on the same IP' do
    # Limit is 5/min/IP. Burst 6 to trigger the throttle.
    6.times do |i|
      post '/api/v1/auth/login', params: { email: "noone#{i}@x", password: "wrong" }, as: :json
    end

    expect(response.status).to eq(429)
    body = JSON.parse(response.body)
    expect(body['code']).to eq('RATE_LIMITED')
  end

  it 'does not throttle below the limit' do
    3.times do |i|
      post '/api/v1/auth/login', params: { email: "noone#{i}@x", password: "wrong" }, as: :json
      expect(response.status).not_to eq(429)
    end
  end
end

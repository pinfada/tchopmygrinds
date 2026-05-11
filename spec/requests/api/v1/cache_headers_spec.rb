require 'rails_helper'

# Regression: BaseController previously set `Cache-Control: public, max-age=300`
# on every API response, including user-scoped endpoints. Shared caches (CDNs,
# proxies) would then serve one user's payload to other users.
RSpec.describe 'API response cache headers', type: :request do
  it 'does not mark API responses as publicly cacheable' do
    # Use a request that goes through BaseController without requiring a valid
    # JWT — the register endpoint skips token auth but still runs the
    # set_response_headers before_action.
    post '/api/v1/auth/register',
         params: {
           user: {
             name: "Cache Tester",
             email: "cache.tester.#{SecureRandom.hex(4)}@example.test",
             password: "Password123!",
             password_confirmation: "Password123!"
           }
         },
         as: :json

    cache_control = response.headers['Cache-Control'].to_s
    expect(cache_control).not_to include('public'),
      "Cache-Control header still contains 'public': #{cache_control.inspect}"
    expect(cache_control).to match(/private|no-store|no-cache/),
      "Cache-Control header should be restrictive, got: #{cache_control.inspect}"
  end

  it 'sets X-Content-Type-Options nosniff' do
    post '/api/v1/auth/register',
         params: {
           user: {
             name: "Nosniff Tester",
             email: "nosniff.#{SecureRandom.hex(4)}@example.test",
             password: "Password123!",
             password_confirmation: "Password123!"
           }
         },
         as: :json

    expect(response.headers['X-Content-Type-Options']).to eq('nosniff')
  end
end

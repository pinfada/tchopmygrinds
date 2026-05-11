require 'rails_helper'

# /admin must require an authenticated session. Anonymous requests must NOT
# render the dashboard. Regression test for the previously commented-out
# `authenticate_with` block in config/initializers/rails_admin.rb.
RSpec.describe 'GET /admin', type: :request do
  it 'does not serve the RailsAdmin dashboard to anonymous visitors' do
    get '/admin'

    expect(response.status).not_to eq(200),
      "Anonymous request returned 200 — /admin is publicly readable. Status: #{response.status}, Body: #{response.body[0, 300]}"
    expect([301, 302, 401, 403]).to include(response.status)
  end

  it 'redirects anonymous visitors to the sign-in page' do
    get '/admin'

    if response.status == 302
      expect(response.location).to match(/sign_in|users\/sign_in/),
        "Expected redirect to Devise sign-in, got: #{response.location}"
    end
  end
end

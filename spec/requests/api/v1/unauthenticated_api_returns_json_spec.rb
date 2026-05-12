require 'rails_helper'

# Browsers send `Accept: */*` on XHR; if API auth fails, Devise's FailureApp
# defaults to an HTML 302 to /users/sign_in. That redirect breaks CORS
# (different path scope) and looks like an unrelated CORS error in the
# frontend console. API endpoints must always answer 401 JSON instead.
RSpec.describe 'API endpoints under /api/v1/* return JSON 401 when unauthenticated', type: :request do
  shared_examples 'JSON 401 not HTML redirect' do |path|
    it "responds 401 JSON (not 302 HTML) for #{path} (XHR Accept: */*)" do
      get path, headers: { 'Accept' => '*/*' }
      expect(response).to have_http_status(:unauthorized)
      expect(response.content_type).to start_with('application/json')
      expect(response.body).not_to include('sign_in')
    end
  end

  include_examples 'JSON 401 not HTML redirect', '/api/v1/messages/conversations'
  include_examples 'JSON 401 not HTML redirect', '/api/v1/messages/unread_count'
  include_examples 'JSON 401 not HTML redirect', '/api/v1/product_interests'
  include_examples 'JSON 401 not HTML redirect', '/api/v1/orders'
end

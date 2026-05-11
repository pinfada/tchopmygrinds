require 'rails_helper'

# Boot-time regression: the controller previously inherited from
# Api::V1::ApplicationController which does not exist. This used to raise
# NameError on the first request to /api/v1/product_interests/*.
RSpec.describe Api::V1::ProductInterestsController do
  it 'is defined and loadable' do
    expect(defined?(Api::V1::ProductInterestsController)).to eq('constant')
  end

  it 'inherits from Api::V1::BaseController' do
    expect(described_class.ancestors).to include(Api::V1::BaseController)
  end

  it 'inherits the JWT authentication filter from BaseController' do
    callbacks = described_class._process_action_callbacks.map(&:filter)
    expect(callbacks).to include(:authenticate_user_from_token!)
  end
end

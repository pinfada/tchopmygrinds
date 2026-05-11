require 'rails_helper'

RSpec.describe 'POST /api/v1/auth/register', type: :request do
  let(:base_attrs) do
    {
      name: "Bob Buyer",
      email: "bob.buyer.#{SecureRandom.hex(4)}@example.test",
      password: "Password123!",
      password_confirmation: "Password123!"
    }
  end

  it 'creates the user but ignores statut_type from the request body' do
    expect {
      post '/api/v1/auth/register',
           params: { user: base_attrs.merge(statut_type: 'itinerant') },
           as: :json
    }.to change(User, :count).by(1)

    created = User.order(:created_at).last
    expect(created.statut_type).not_to eq('itinerant')
    expect(created.statut_type).not_to eq('sedentary')
  end

  it 'ignores admin flag from the request body' do
    post '/api/v1/auth/register',
         params: { user: base_attrs.merge(admin: true) },
         as: :json

    created = User.order(:created_at).last
    expect(created.admin).to be_falsey
  end
end

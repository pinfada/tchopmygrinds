require 'rails_helper'

# Regression specs for the Devise registration endpoint. The public sign-up
# flow must never let a visitor self-assign a merchant role or admin flag.
RSpec.describe 'POST /users (Devise registration)', type: :request do
  let(:valid_attrs) do
    {
      name: "Alice Buyer",
      email: "alice.buyer.#{SecureRandom.hex(4)}@example.test",
      password: "Password123!",
      password_confirmation: "Password123!"
    }
  end

  it 'ignores statut_type submitted in the form and does not promote the user to merchant' do
    expect {
      post user_registration_path, params: { user: valid_attrs.merge(statut_type: 'itinerant') }
    }.to change(User, :count).by(1)

    created = User.order(:created_at).last
    expect(created.statut_type).not_to eq('itinerant')
    expect(created.statut_type).not_to eq('sedentary')
  end

  it 'ignores seller_role / buyer_role submitted in the form' do
    post user_registration_path, params: { user: valid_attrs.merge(seller_role: true, buyer_role: true) }

    created = User.order(:created_at).last
    # The default for these boolean columns must remain falsey for new sign-ups.
    expect(created.seller_role).to be_falsey
    expect(created.buyer_role).to be_falsey
  end

  it 'ignores admin flag submitted in the form' do
    post user_registration_path, params: { user: valid_attrs.merge(admin: true) }

    created = User.order(:created_at).last
    expect(created.admin).to be_falsey
  end
end

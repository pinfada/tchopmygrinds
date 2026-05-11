require 'rails_helper'

# Regression spec for the RGPD fix (Lot 2 / C10). The merchant-facing payload
# returned by Api::V1::ProductInterestsController#format_merchant_interest must
# never include the buyer's email.
RSpec.describe Api::V1::ProductInterestsController, type: :controller do
  let(:merchant) { FactoryBot.create(:user, :sedentary) }
  let(:buyer)    { FactoryBot.create(:user, name: "Alice Buyer") }
  let!(:commerce) { FactoryBot.create(:commerce, user: merchant) }

  it 'does not include the buyer email in the merchant-facing payload' do
    interest = ProductInterest.create!(
      user: buyer,
      product_name: "tomato",
      user_latitude: 48.85,
      user_longitude: 2.35,
      search_radius: 5
    )

    # Call the private formatter directly — we don't need to exercise auth
    # to validate the RGPD payload shape.
    controller.instance_variable_set(:@_current_user, merchant)
    allow(controller).to receive(:current_user).and_return(merchant)

    payload = controller.send(:format_merchant_interest, interest)

    expect(payload[:user]).not_to have_key(:email)
    expect(payload[:user][:id]).to eq(buyer.id)
    # display_name is the first space-separated token of the buyer's name
    expect(payload[:user][:display_name]).to eq("Alice")
  end
end

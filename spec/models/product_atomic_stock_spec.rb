require 'rails_helper'

# Regression spec for the atomic stock decrement used by
# Api::V1::OrdersController#create. We exercise the same conditional update
# the controller issues — without going through the controller, which depends
# on a separate state-machine bug (status: 'pending' vs enum :Waiting) that is
# scheduled to be fixed in Lot 3.
#
# True multi-process concurrency cannot be verified here under SQLite +
# transactional fixtures. This spec verifies the SQL contract: a conditional
# decrement either succeeds atomically OR affects zero rows, never undershoots.
RSpec.describe 'Atomic stock decrement on Product', type: :model do
  let!(:merchant) do
    User.create!(
      email: "merchant.#{SecureRandom.hex(4)}@example.test",
      password: "Password123!",
      name: "Merchant"
    )
  end

  let!(:commerce) do
    Commerce.create!(name: "Shop", user: merchant)
  end

  let!(:product) do
    Product.create!(
      name: "Limited Item",
      quantityperunit: "1 unit",
      unitprice: 5.00,
      unitsinstock: 5,
      unitsonorder: 0,
      commerce: commerce
    )
  end

  def conditional_decrement(quantity)
    Product.where(id: product.id)
           .where("unitsinstock >= ?", quantity)
           .update_all(["unitsinstock = unitsinstock - ?", quantity])
  end

  it 'decrements stock and returns 1 when the requested quantity is available' do
    affected = conditional_decrement(3)

    expect(affected).to eq(1)
    expect(product.reload.unitsinstock).to eq(2)
  end

  it 'returns 0 and leaves stock untouched when the requested quantity exceeds available' do
    affected = conditional_decrement(10)

    expect(affected).to eq(0)
    expect(product.reload.unitsinstock).to eq(5)
  end

  it 'allows the first of two competing orders to succeed and rejects the second when only one fits' do
    # First buyer takes 4 of 5.
    expect(conditional_decrement(4)).to eq(1)
    expect(product.reload.unitsinstock).to eq(1)

    # Second buyer requests 4. Only 1 remains; the conditional update affects 0 rows.
    expect(conditional_decrement(4)).to eq(0)
    expect(product.reload.unitsinstock).to eq(1) # untouched
  end

  it 'never produces a negative stock value, even with back-to-back decrements' do
    # Drain the stock.
    expect(conditional_decrement(5)).to eq(1)
    expect(product.reload.unitsinstock).to eq(0)

    # Any further decrement must be a no-op.
    expect(conditional_decrement(1)).to eq(0)
    expect(product.reload.unitsinstock).to eq(0)
  end
end

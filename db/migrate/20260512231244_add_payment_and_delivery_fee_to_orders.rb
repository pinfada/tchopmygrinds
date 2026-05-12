class AddPaymentAndDeliveryFeeToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :payment_method, :string
    add_column :orders, :delivery_fee, :decimal, precision: 10, scale: 2, default: 0, null: false
  end
end

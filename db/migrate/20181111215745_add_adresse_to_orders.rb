class AddAdresseToOrders < ActiveRecord::Migration[5.2]
  def change
    add_reference :orders, :payment_address, foreign_key: true
    add_reference :orders, :delivery_address, foreign_key: true
  end
end

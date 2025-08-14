class AddFieldsToOrdersForApi < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :total_amount, :decimal, precision: 10, scale: 2
    add_column :orders, :delivery_address, :string
    add_column :orders, :phone, :string
    add_column :orders, :notes, :text
    
    add_index :orders, :total_amount
  end
end

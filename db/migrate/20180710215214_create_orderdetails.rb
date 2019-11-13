class CreateOrderDetails < ActiveRecord::Migration[5.0]
  def change
    create_table :orderdetails do |t|
      t.decimal :UnitPrice, :precision => 8, :scale => 2
      t.integer :Quantity, default: 1
      t.decimal :Discount, :precision => 8, :scale => 0, default: 0
      t.references :product, foreign_key: true
      t.references :order, foreign_key: true
      t.timestamps
    end
  end
end

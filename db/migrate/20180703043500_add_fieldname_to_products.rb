class AddFieldnameToProducts < ActiveRecord::Migration[5.0]
  def change
    add_column :products, :QuantityPerUnit, :string
    add_column :products, :UnitPrice, :decimal, :precision => 10, :scale => 2
    add_column :products, :UnitsInStock, :integer, default: 0
    add_column :products, :UnitsOnOrder, :integer, default: 0
    add_column :products, :ReorderLevel, :integer, default: 0
    add_column :products, :Discontinued, :boolean, default: false
  end
end

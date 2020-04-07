class ChangeUnitPriceTounitprice < ActiveRecord::Migration[5.2]
  def change
  	rename_column :orderdetails, :UnitPrice, :unitprice
  	rename_column :orderdetails, :Quantity, :quantity
  	rename_column :orderdetails, :Discount, :discount
  end
end

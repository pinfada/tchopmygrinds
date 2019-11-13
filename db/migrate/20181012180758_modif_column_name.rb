class ModifColumnName < ActiveRecord::Migration[5.0]
  def change
    rename_column :products, :QuantityPerUnit, :quantityperunit
    rename_column :products, :UnitPrice, :unitprice
    rename_column :products, :UnitsInStock, :unitsinstock
    rename_column :products, :UnitsOnOrder, :unitsonorder
    rename_column :products, :ReorderLevel, :reorderlevel
    rename_column :products, :Discontinued, :discontinued
    rename_column :orders, :RequiredDate, :requiredate
    rename_column :orders, :ShippedDate, :shippedate
  end
end

class ChangeOrderDateToOrderdate < ActiveRecord::Migration[5.2]
  def change
  	rename_column :orders, :OrderDate, :orderdate
  end
end

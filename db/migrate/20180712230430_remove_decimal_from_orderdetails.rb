class RemoveDecimalFromOrderdetails < ActiveRecord::Migration[5.0]
  def change
    remove_column :orderdetails, :decimal, :decimal
  end
end

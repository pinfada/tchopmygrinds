class RemoveOrderFromCommerces < ActiveRecord::Migration[5.0]
  def change
    remove_reference :commerces, :order, foreign_key: true
  end
end

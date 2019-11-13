class AddOrderToCommerces < ActiveRecord::Migration[5.0]
  def change
    add_reference :commerces, :order, foreign_key: true
  end
end

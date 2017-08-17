class CreateJoinTableCommerceProduct < ActiveRecord::Migration[5.0]
  def change
    create_join_table :commerces, :products do |t|
      t.index [:commerce_id, :product_id]
      # t.index [:product_id, :commerce_id]
    end
  end
end

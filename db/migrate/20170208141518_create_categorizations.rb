class CreateCategorizations < ActiveRecord::Migration[5.0]
  def change
    create_table :categorizations do |t|
      t.integer :product_id
      t.integer :commerce_id
      t.integer :position

      t.timestamps
    end
    
    add_index :categorizations, [:product_id, :commerce_id]
  end
end

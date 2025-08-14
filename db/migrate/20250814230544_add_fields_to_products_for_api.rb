class AddFieldsToProductsForApi < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :category, :string
    add_column :products, :description, :text
    add_column :products, :image_url, :string
    add_column :products, :available, :boolean, default: true
    
    add_index :products, :category
    add_index :products, :available
  end
end

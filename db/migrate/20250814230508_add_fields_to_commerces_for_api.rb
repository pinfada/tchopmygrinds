class AddFieldsToCommercesForApi < ActiveRecord::Migration[7.1]
  def change
    add_column :commerces, :rating, :decimal, precision: 3, scale: 2, default: 0.0
    add_column :commerces, :rating_count, :integer, default: 0
    add_column :commerces, :verified, :boolean, default: false
    add_column :commerces, :category, :string
    add_column :commerces, :phone, :string
    add_column :commerces, :website, :string
    add_column :commerces, :opening_hours, :text
    add_column :commerces, :image_url, :string
    
    add_index :commerces, :category
    add_index :commerces, :verified
    add_index :commerces, :rating
  end
end

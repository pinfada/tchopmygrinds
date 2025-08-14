class AddFieldsToUsersForApi < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :phone, :string
    add_column :users, :avatar_url, :string
    
    add_index :users, :phone
  end
end

class AddRolesToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :seller_role, :boolean, default: false
    add_column :users, :buyer_role, :boolean, default: false
  end
end

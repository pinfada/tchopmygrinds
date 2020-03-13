class DropUseradressesTable < ActiveRecord::Migration[5.2]
  def change
    drop_table :useradresses do |t|
        t.integer :user_id, null: false
    	t.text :address_1, null: false
    	t.text :address_2, null: false
    	t.text :city, null: false
    	t.text :state, null: false
    	t.text :country, null: false
    	t.text :zipcode, null: false
        t.timestamps null: false
    end
  end
end

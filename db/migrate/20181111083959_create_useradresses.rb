class CreateUseradresses < ActiveRecord::Migration[5.2]
  def change
    create_table :useradresses do |t|
      t.references :user, foreign_key: true
    	t.text :address_1
    	t.text :address_2
    	t.text :city
    	t.text :state
    	t.text :country
    	t.text :zipcode
    	
      t.timestamps
    end
  end
end

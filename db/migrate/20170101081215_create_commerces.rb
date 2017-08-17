class CreateCommerces < ActiveRecord::Migration[5.0]
  def change
    create_table :commerces do |t|
      t.string :name
      t.string :adress1
      t.string :adress2
      t.string :details
      t.string :postal
      t.string :country
      t.float :lat
      t.float :lon

      t.timestamps
    end
  end
end

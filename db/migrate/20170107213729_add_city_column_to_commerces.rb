class AddCityColumnToCommerces < ActiveRecord::Migration[5.0]
  def change
    add_column :commerces, :city, :string
  end
end

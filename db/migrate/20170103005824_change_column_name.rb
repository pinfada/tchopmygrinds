class ChangeColumnName < ActiveRecord::Migration[5.0]
  def change
    rename_column :commerces, :lat, :latitude
    rename_column :commerces, :lon, :longitude
  end
end

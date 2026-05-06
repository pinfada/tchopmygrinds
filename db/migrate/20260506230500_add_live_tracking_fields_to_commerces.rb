class AddLiveTrackingFieldsToCommerces < ActiveRecord::Migration[7.1]
  def change
    add_column :commerces, :is_online, :boolean, default: false, null: false
    add_column :commerces, :location_updated_at, :datetime

    add_index :commerces, :is_online
    add_index :commerces, :location_updated_at
  end
end

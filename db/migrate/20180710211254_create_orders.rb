class CreateOrders < ActiveRecord::Migration[5.0]
  def change
    create_table :orders do |t|
      t.date :OrderDate
      t.date :RequiredDate
      t.datetime :ShippedDate
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end

class AddUserRefToCommerces < ActiveRecord::Migration[5.2]
  def change
    add_reference :commerces, :user, foreign_key: true
  end
end

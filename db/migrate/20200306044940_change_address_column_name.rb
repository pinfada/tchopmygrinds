class ChangeAddressColumnName < ActiveRecord::Migration[5.2]
  def change
    rename_column :addresses, :address_1, :address1
    rename_column :addresses, :address_2, :address2
  end
end

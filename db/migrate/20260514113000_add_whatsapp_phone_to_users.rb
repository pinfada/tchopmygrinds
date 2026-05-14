class AddWhatsappPhoneToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :whatsapp_phone, :string
  end
end

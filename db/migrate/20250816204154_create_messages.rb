class CreateMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :messages do |t|
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.references :receiver, null: false, foreign_key: { to_table: :users }
      t.text :content, null: false
      t.string :subject
      t.datetime :read_at
      t.string :conversation_id, null: false
      t.integer :message_type, default: 0
      t.references :product, null: true, foreign_key: true
      t.references :commerce, null: true, foreign_key: true

      t.timestamps
    end

    add_index :messages, :conversation_id
    add_index :messages, [:sender_id, :receiver_id]
    add_index :messages, :read_at
    add_index :messages, :created_at
  end
end

class CreateFavorites < ActiveRecord::Migration[7.1]
  def change
    create_table :favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.references :commerce, null: false, foreign_key: true
      t.timestamps
    end

    # A user can favorite a given commerce only once.
    add_index :favorites, [:user_id, :commerce_id], unique: true
  end
end

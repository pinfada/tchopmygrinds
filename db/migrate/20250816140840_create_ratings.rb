class CreateRatings < ActiveRecord::Migration[7.1]
  def change
    create_table :ratings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :rateable, polymorphic: true, null: false
      t.integer :rating, null: false
      t.text :comment
      t.boolean :verified, default: false
      t.boolean :moderated, default: false
      t.integer :helpful_count, default: 0
      t.references :order, null: true, foreign_key: true  # Pour vérifier les achats

      t.timestamps
    end

    # Index pour les requêtes fréquentes
    add_index :ratings, [:rateable_type, :rateable_id]
    add_index :ratings, [:user_id, :rateable_type, :rateable_id], unique: true, name: 'index_ratings_unique_per_user'
    add_index :ratings, :rating
    add_index :ratings, :verified
    add_index :ratings, :moderated
  end
end

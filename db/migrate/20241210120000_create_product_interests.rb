class CreateProductInterests < ActiveRecord::Migration[6.0]
  def change
    create_table :product_interests do |t|
      t.references :user, null: false, foreign_key: true
      t.string :product_name, null: false
      t.decimal :user_latitude, precision: 10, scale: 6, null: false
      t.decimal :user_longitude, precision: 10, scale: 6, null: false
      t.integer :search_radius, default: 25
      t.text :message
      t.boolean :fulfilled, default: false
      t.datetime :fulfilled_at
      t.boolean :email_sent, default: false
      
      t.timestamps
    end
    
    # Index pour optimiser les recherches géographiques
    add_index :product_interests, [:user_latitude, :user_longitude]
    add_index :product_interests, :product_name
    add_index :product_interests, :fulfilled
    add_index :product_interests, :created_at
    
    # Index composite pour les requêtes fréquentes
    add_index :product_interests, [:fulfilled, :product_name, :created_at], name: 'idx_interests_fulfilled_name_date'
  end
end
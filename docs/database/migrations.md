# Documentation Base de Données - Migrations

## Historique des Migrations

L'évolution de la base de données TchopMyGrinds suit une progression logique depuis la création initiale jusqu'aux fonctionnalités avancées.

### Chronologie des Migrations

```ruby
# db/migrate/
20170101081215_create_commerces.rb           # Commerce de base
20170103005824_change_column_name.rb         # Corrections noms colonnes
20170107213729_add_city_column_to_commerces.rb # Ajout ville
20170208140625_create_products.rb            # Catalogue produits
20170208140804_create_join_table_commerce_product.rb # Relation M:N
20170208141518_create_categorizations.rb     # Table de liaison
20180703043500_add_fieldname_to_products.rb  # Champs produits
20180704203654_devise_create_users.rb        # Authentification Devise
20180704204857_add_name_to_users.rb          # Nom utilisateur
20180704222224_add_admin_to_users.rb         # Rôle admin
20180710211254_create_orders.rb              # Système commandes
20180710215214_orderdetails.rb               # Détails commandes
20180721084122_add_order_to_commerces.rb     # Relation temporaire
20180722091505_remove_order_from_commerces.rb # Suppression relation
20180914124810_add_roles_to_users.rb         # Système rôles
20181012180758_modif_column_name.rb          # Standardisation noms
20181014162102_add_commerce_to_products.rb   # Relation produits
20181110192002_add_status_to_orders.rb       # Statuts commandes
20181111083959_create_useradresses.rb        # Adresses v1 (supprimée)
20200205093623_add_user_ref_to_commerces.rb  # Relations utilisateur
20200214055230_add_status_to_users.rb        # Statut utilisateur
20200216071553_rename_status_to_statut_type.rb # Types utilisateur
20200229064801_drop_useradresses_table.rb    # Suppression table
20200301023106_table_addresses.rb            # Adresses v2
20200301031156_add_columns_to_adresses.rb    # Champs adresses
20200306044940_change_address_column_name.rb # Corrections
20200404130633_change_order_date_to_orderdate.rb # Dates commandes
20200405230625_change_unit_price_tounitprice.rb # Prix unitaires
20200418234522_create_newsletters.rb         # Newsletter
```

## Migrations Critiques Détaillées

### 1. Création des Commerces (2017-01-01)

```ruby
# db/migrate/20170101081215_create_commerces.rb
class CreateCommerces < ActiveRecord::Migration[5.0]
  def change
    create_table :commerces do |t|
      t.string :nom, null: false
      t.text :description
      t.string :adresse
      t.string :telephone
      
      t.timestamps null: false
    end
    
    add_index :commerces, :nom
  end
end
```

### 2. Ajout Ville aux Commerces (2017-01-07)

```ruby  
# db/migrate/20170107213729_add_city_column_to_commerces.rb
class AddCityColumnToCommerces < ActiveRecord::Migration[5.0]
  def change
    add_column :commerces, :ville, :string
    add_index :commerces, :ville
    
    # Mise à jour des données existantes si nécessaire
    reversible do |dir|
      dir.up do
        Commerce.update_all(ville: 'Non spécifiée')
      end
    end
  end
end
```

### 3. Système de Produits (2017-02-08)

```ruby
# db/migrate/20170208140625_create_products.rb  
class CreateProducts < ActiveRecord::Migration[5.0]
  def change
    create_table :products do |t|
      t.string :nom, null: false
      t.text :description
      t.decimal :price, precision: 8, scale: 2, default: 0.0
      t.integer :stock, default: 0
      
      t.timestamps null: false
    end
    
    add_index :products, :nom
    add_index :products, :price
  end
end
```

### 4. Table de Liaison Commerce-Product (2017-02-08)

```ruby
# db/migrate/20170208141518_create_categorizations.rb
class CreateCategorizations < ActiveRecord::Migration[5.0]
  def change
    create_table :categorizations do |t|
      t.references :commerce, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      
      t.timestamps null: false
    end
    
    # Index unique pour éviter les doublons
    add_index :categorizations, [:commerce_id, :product_id], unique: true
  end
end
```

### 5. Authentification Devise (2018-07-04)

```ruby
# db/migrate/20180704203654_devise_create_users.rb
class DeviseCreateUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      t.integer  :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.inet     :current_sign_in_ip
      t.inet     :last_sign_in_ip

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
  end
end
```

### 6. Système de Rôles (2018-09-14)

```ruby
# db/migrate/20180914124810_add_roles_to_users.rb  
class AddRolesToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :seller_role, :boolean, default: false
    add_column :users, :buyer_role, :boolean, default: true
    
    add_index :users, :seller_role
    add_index :users, :buyer_role
    
    # Migration des données existantes
    reversible do |dir|
      dir.up do
        # Tous les utilisateurs existants deviennent acheteurs par défaut
        User.update_all(buyer_role: true)
      end
    end
  end
end
```

### 7. Système de Commandes (2018-07-10)

```ruby
# db/migrate/20180710211254_create_orders.rb
class CreateOrders < ActiveRecord::Migration[5.2]
  def change
    create_table :orders do |t|
      t.datetime :orderdate, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.references :user, null: false, foreign_key: true
      
      t.timestamps null: false
    end
    
    add_index :orders, :user_id
    add_index :orders, :orderdate
  end
end

# db/migrate/20180710215214_orderdetails.rb
class CreateOrderdetails < ActiveRecord::Migration[5.2]
  def change
    create_table :orderdetails do |t|
      t.integer :quantity, null: false, default: 1
      t.decimal :unitprice, precision: 8, scale: 2, null: false
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      
      t.timestamps null: false
    end
    
    add_index :orderdetails, :order_id
    add_index :orderdetails, :product_id
  end
end
```

### 8. Statuts de Commandes (2018-11-10)

```ruby
# db/migrate/20181110192002_add_status_to_orders.rb
class AddStatusToOrders < ActiveRecord::Migration[5.2]
  def change
    add_column :orders, :status, :string, default: 'Waiting'
    add_index :orders, :status
    
    # Mise à jour des commandes existantes
    reversible do |dir|
      dir.up do
        Order.where(status: nil).update_all(status: 'Waiting')
      end
    end
  end
end
```

### 9. Types d'Utilisateurs (2020-02-16)

```ruby
# db/migrate/20200216071553_rename_status_to_statut_type.rb
class RenameStatusToStatutType < ActiveRecord::Migration[6.0]
  def change
    rename_column :users, :status, :statut_type
    
    # Mise à jour des valeurs
    reversible do |dir|
      dir.up do
        # Migration des anciennes valeurs booléennes vers types
        execute <<-SQL
          UPDATE users 
          SET statut_type = CASE 
            WHEN seller_role = true AND statut_type = true THEN 'sedentary'
            WHEN seller_role = true AND statut_type = false THEN 'itinerant' 
            ELSE 'others'
          END
        SQL
      end
    end
    
    add_index :users, :statut_type
  end
end
```

### 10. Système d'Adresses v2 (2020-03-01)

```ruby
# db/migrate/20200301023106_table_addresses.rb
class CreateAddresses < ActiveRecord::Migration[6.0]
  def change
    create_table :addresses do |t|
      t.string :street, null: false
      t.string :city, null: false  
      t.string :postal_code
      t.string :country, default: 'France'
      t.references :user, null: false, foreign_key: true
      
      t.timestamps null: false
    end
    
    add_index :addresses, :user_id
  end
end

# db/migrate/20200301031156_add_columns_to_adresses.rb  
class AddColumnsToAddresses < ActiveRecord::Migration[6.0]
  def change
    # Ajout géolocalisation
    add_column :addresses, :latitude, :decimal, precision: 10, scale: 6
    add_column :addresses, :longitude, :decimal, precision: 10, scale: 6
    
    # Index géospatial
    add_index :addresses, [:latitude, :longitude]
  end
end
```

### 11. Relations Commerce-Utilisateur (2020-02-05)

```ruby
# db/migrate/20200205093623_add_user_ref_to_commerces.rb
class AddUserRefToCommerces < ActiveRecord::Migration[6.0]
  def change
    add_reference :commerces, :user, null: false, foreign_key: true
    
    # Migration des données existantes si applicable
    reversible do |dir|
      dir.up do
        # Associer les commerces existants au premier admin
        admin_user = User.where(admin: true).first
        if admin_user
          Commerce.where(user_id: nil).update_all(user_id: admin_user.id)
        end
      end
    end
    
    add_index :commerces, :user_id
  end
end
```

## Migrations de Standardisation

### Standardisation des Noms de Colonnes

```ruby
# db/migrate/20200405230625_change_unit_price_tounitprice.rb
class ChangeUnitPriceToUnitprice < ActiveRecord::Migration[6.0]
  def change
    # Renommage pour cohérence avec Rails conventions
    rename_column :products, :price, :unitprice if column_exists?(:products, :price)
    rename_column :products, :stock, :unitsinstock if column_exists?(:products, :stock)
    
    # Ajout colonne manquante
    add_column :products, :unitsonorder, :integer, default: 0 unless column_exists?(:products, :unitsonorder)
  end
end

# db/migrate/20200404130633_change_order_date_to_orderdate.rb  
class ChangeOrderDateToOrderdate < ActiveRecord::Migration[6.0]
  def change
    rename_column :orders, :order_date, :orderdate if column_exists?(:orders, :order_date)
  end
end
```

## Ajout de la Géolocalisation

```ruby
# Migration pour ajouter géolocalisation aux commerces
class AddGeolocationToCommerces < ActiveRecord::Migration[6.0]
  def change
    add_column :commerces, :latitude, :decimal, precision: 10, scale: 6
    add_column :commerces, :longitude, :decimal, precision: 10, scale: 6
    
    # Index composite pour recherches géospatiales
    add_index :commerces, [:latitude, :longitude], name: 'index_commerces_on_coordinates'
    
    # Mise à jour des commerces existants
    reversible do |dir|
      dir.up do
        Commerce.find_each do |commerce|
          # Géocodage des adresses existantes
          if commerce.adresse.present? && commerce.ville.present?
            full_address = "#{commerce.adresse}, #{commerce.ville}, France"
            # Le géocodage sera fait automatiquement par le modèle Geocoder
            commerce.geocode
            commerce.save
          end
        end
      end
    end
  end
end
```

## Migration Newsletter (2020-04-18)

```ruby
# db/migrate/20200418234522_create_newsletters.rb
class CreateNewsletters < ActiveRecord::Migration[6.0]
  def change
    create_table :newsletters do |t|
      t.string :email, null: false
      t.boolean :subscribed, default: true
      
      t.timestamps null: false
    end
    
    add_index :newsletters, :email, unique: true
    add_index :newsletters, :subscribed
  end
end
```

## Commandes de Migration Utiles

### Exécution et Rollback
```bash
# Exécuter toutes les migrations en attente
rails db:migrate

# Rollback de la dernière migration
rails db:rollback

# Rollback de N migrations  
rails db:rollback STEP=3

# Migration vers une version spécifique
rails db:migrate VERSION=20200301023106

# Statut des migrations
rails db:migrate:status

# Réinitialisation complète
rails db:drop db:create db:migrate db:seed
```

### Utilitaires de Données
```bash
# Réinitialisation avec données de test
rails db:reset

# Rechargement du schéma depuis schema.rb
rails db:schema:load

# Dump du schéma actuel
rails db:schema:dump

# Vérification de l'intégrité
rails db:migrate:check
```

## Bonnes Pratiques Utilisées

### 1. Migrations Réversibles
```ruby
# Utilisation de change au lieu de up/down quand possible
def change
  add_column :table, :column, :type
end

# Pour les cas complexes
def up
  # Actions à faire
end

def down  
  # Actions à défaire
end
```

### 2. Gestion des Données Existantes
```ruby
reversible do |dir|
  dir.up do
    # Actions lors de la migration up
    User.where(role: nil).update_all(role: 'buyer')
  end
  
  dir.down do
    # Actions lors du rollback
    # Optionnel si les données peuvent être perdues
  end
end
```

### 3. Index et Performance
```ruby
# Index simples
add_index :table, :column

# Index composites
add_index :table, [:col1, :col2], name: 'custom_index_name'

# Index uniques
add_index :table, :email, unique: true

# Index partiels (PostgreSQL)
add_index :table, :column, where: "column IS NOT NULL"
```

Cette progression des migrations montre l'évolution naturelle du projet depuis un simple annuaire de commerces vers une plateforme e-commerce complète avec géolocalisation.
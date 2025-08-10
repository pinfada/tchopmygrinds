# Documentation Base de Données - Schéma

## Vue d'ensemble du Schéma

La base de données PostgreSQL de TchopMyGrinds est conçue pour supporter un système e-commerce géolocalisé avec gestion multi-rôles.

### Tables Principales

```sql
-- Structure générale
users                 # Utilisateurs (acheteurs/vendeurs)
├── commerces         # Commerces des vendeurs
│   └── categorizations # Liaison commerce-produits
│       └── products    # Catalogue produits
├── orders           # Commandes clients
│   └── orderdetails # Détails des commandes
└── addresses        # Adresses de livraison

newsletters          # Abonnements newsletter
```

## Table `users`

Table centrale pour l'authentification et la gestion des utilisateurs avec Devise.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  encrypted_password VARCHAR NOT NULL,
  name VARCHAR,
  statut_type VARCHAR DEFAULT 'others', -- 'itinerant', 'sedentary', 'others'
  seller_role BOOLEAN DEFAULT FALSE,
  buyer_role BOOLEAN DEFAULT TRUE,
  admin BOOLEAN DEFAULT FALSE,
  status BOOLEAN DEFAULT TRUE, -- Compte actif/inactif
  
  -- Champs Devise
  reset_password_token VARCHAR UNIQUE,
  reset_password_sent_at TIMESTAMP,
  remember_created_at TIMESTAMP,
  sign_in_count INTEGER DEFAULT 0,
  current_sign_in_at TIMESTAMP,
  last_sign_in_at TIMESTAMP,
  current_sign_in_ip INET,
  last_sign_in_ip INET,
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index pour les performances
CREATE INDEX index_users_on_email ON users (email);
CREATE INDEX index_users_on_reset_password_token ON users (reset_password_token);
CREATE INDEX index_users_on_statut_type ON users (statut_type);
CREATE INDEX index_users_on_seller_role ON users (seller_role);
```

### Types d'Utilisateurs
- **`itinerant`**: Marchands mobiles (food trucks, marchés ambulants)
- **`sedentary`**: Marchands avec emplacement fixe (boutiques, restaurants)  
- **`others`**: Clients/acheteurs standard

### Rôles
- **`seller_role`**: Peut créer des commerces et vendre des produits
- **`buyer_role`**: Peut passer des commandes
- **`admin`**: Accès administrateur complet

## Table `commerces`

Représente les boutiques/établissements des marchands avec capacités géospatiales.

```sql
CREATE TABLE commerces (
  id SERIAL PRIMARY KEY,
  nom VARCHAR NOT NULL,
  description TEXT,
  adresse VARCHAR,
  ville VARCHAR NOT NULL,
  telephone VARCHAR,
  
  -- Géolocalisation (automatique via Geocoder)
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  
  -- Relations
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index géospatiaux pour les recherches de proximité
CREATE INDEX index_commerces_on_latitude_and_longitude ON commerces (latitude, longitude);
CREATE INDEX index_commerces_on_user_id ON commerces (user_id);
CREATE INDEX index_commerces_on_ville ON commerces (ville);

-- Index composite pour les requêtes géolocalisées
CREATE INDEX index_commerces_geolocation ON commerces (latitude, longitude, id);
```

### Fonctionnalités Géographiques
- **Géocodage automatique** : Rails/Geocoder convertit automatiquement les adresses en coordonnées
- **Recherche par proximité** : Requêtes dans un rayon de X kilomètres
- **Calcul de distance** : Distance entre utilisateur et commerce

## Table `products`

Catalogue des produits avec gestion de stock et prix.

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  nom VARCHAR NOT NULL,
  description TEXT,
  
  -- Gestion prix et stock
  unitprice DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  unitsinstock INTEGER NOT NULL DEFAULT 0,
  unitsonorder INTEGER DEFAULT 0, -- Stock en cours de réapprovisionnement
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index pour les recherches et filtres
CREATE INDEX index_products_on_nom ON products (nom);
CREATE INDEX index_products_on_unitprice ON products (unitprice);
CREATE INDEX index_products_on_unitsinstock ON products (unitsinstock);
```

### Gestion du Stock
- **`unitsinstock`**: Stock disponible actuellement
- **`unitsonorder`**: Quantité en cours de réapprovisionnement
- **`unitprice`**: Prix unitaire en euros

## Table `categorizations`

Table de liaison many-to-many entre `commerces` et `products`.

```sql
CREATE TABLE categorizations (
  id SERIAL PRIMARY KEY,
  commerce_id INTEGER NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index pour les jointures
CREATE UNIQUE INDEX index_categorizations_on_commerce_and_product 
  ON categorizations (commerce_id, product_id);
CREATE INDEX index_categorizations_on_product_id ON categorizations (product_id);
```

**Logique Métier** : Un produit peut être vendu par plusieurs commerces, et un commerce peut vendre plusieurs produits.

## Table `orders`

Commandes passées par les clients avec suivi de statut.

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  orderdate TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Statut de la commande
  status INTEGER DEFAULT 0, -- Enum géré par Rails
  
  -- Relations
  user_id INTEGER NOT NULL REFERENCES users(id),
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index pour les requêtes fréquentes
CREATE INDEX index_orders_on_user_id ON orders (user_id);
CREATE INDEX index_orders_on_status ON orders (status);
CREATE INDEX index_orders_on_orderdate ON orders (orderdate DESC);
```

### États de Commande (Enum Rails)
```ruby
# Dans le modèle Order
enum status: {
  "Waiting" => 0,      # En attente de confirmation marchand
  "Accepted" => 1,     # Acceptée par le marchand  
  "In_Progress" => 2,  # En cours de préparation
  "Shipped" => 3,      # Expédiée
  "Delivered" => 4,    # Livrée au client
  "Completed" => 5,    # Terminée et payée
  "Cancelled" => 6     # Annulée
}
```

## Table `orderdetails`

Détails des produits dans chaque commande (ligne de commande).

```sql
CREATE TABLE orderdetails (
  id SERIAL PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 1,
  unitprice DECIMAL(8,2) NOT NULL, -- Prix au moment de la commande
  
  -- Relations
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index pour les jointures et calculs
CREATE INDEX index_orderdetails_on_order_id ON orderdetails (order_id);
CREATE INDEX index_orderdetails_on_product_id ON orderdetails (product_id);
```

### Logique Prix
- Le `unitprice` est fixé au moment de la commande pour éviter les variations de prix
- Calcul du sous-total : `quantity * unitprice`
- Total commande : somme de tous les orderdetails

## Table `addresses`

Adresses de livraison des utilisateurs avec géocodage.

```sql
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  street VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  postal_code VARCHAR,
  country VARCHAR DEFAULT 'France',
  
  -- Géolocalisation automatique
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  
  -- Relations  
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Index pour géolocalisation et utilisateur
CREATE INDEX index_addresses_on_user_id ON addresses (user_id);
CREATE INDEX index_addresses_on_coordinates ON addresses (latitude, longitude);
```

## Table `newsletters`

Gestion des abonnements newsletter.

```sql
CREATE TABLE newsletters (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  subscribed BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX index_newsletters_on_email ON newsletters (email);
CREATE INDEX index_newsletters_on_subscribed ON newsletters (subscribed);
```

## Contraintes et Validations

### Contraintes de Base de Données

```sql
-- Contraintes NOT NULL essentielles
ALTER TABLE users ADD CONSTRAINT users_email_not_null CHECK (email IS NOT NULL);
ALTER TABLE commerces ADD CONSTRAINT commerces_nom_not_null CHECK (nom IS NOT NULL);
ALTER TABLE products ADD CONSTRAINT products_unitprice_positive CHECK (unitprice >= 0);

-- Contraintes de cohérence
ALTER TABLE orderdetails ADD CONSTRAINT orderdetails_quantity_positive CHECK (quantity > 0);
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (unitsinstock >= 0);
```

### Validations Rails (Modèles)

```ruby
# User model validations
validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
validates :name, presence: true
validate :must_have_role

# Commerce model validations  
validates :nom, presence: true
validates :ville, presence: true
validates :user_id, presence: true
validate :user_must_be_seller

# Product model validations
validates :nom, presence: true
validates :unitprice, presence: true, numericality: { greater_than: 0 }
validates :unitsinstock, presence: true, numericality: { greater_than_or_equal_to: 0 }

# Order model validations
validates :user_id, presence: true
validates :orderdate, presence: true
validate :must_have_order_details
```

## Requêtes SQL Courantes

### Recherche Géolocalisée de Commerces

```sql
-- Recherche dans un rayon de 50km autour d'une position
SELECT c.*, u.name as owner_name,
       (6371 * acos(cos(radians(?)) * cos(radians(c.latitude)) * 
        cos(radians(c.longitude) - radians(?)) + 
        sin(radians(?)) * sin(radians(c.latitude)))) AS distance
FROM commerces c
JOIN users u ON c.user_id = u.id  
WHERE c.latitude IS NOT NULL 
  AND c.longitude IS NOT NULL
HAVING distance <= 50
ORDER BY distance;
```

### Produits d'un Commerce avec Stock

```sql
-- Produits disponibles d'un commerce spécifique
SELECT p.*, cat.commerce_id
FROM products p
JOIN categorizations cat ON p.id = cat.product_id
WHERE cat.commerce_id = ? 
  AND p.unitsinstock > 0
ORDER BY p.nom;
```

### Historique des Commandes

```sql
-- Commandes d'un utilisateur avec détails
SELECT o.id, o.orderdate, o.status,
       COUNT(od.id) as items_count,
       SUM(od.quantity * od.unitprice) as total_amount
FROM orders o
LEFT JOIN orderdetails od ON o.id = od.order_id  
WHERE o.user_id = ?
GROUP BY o.id, o.orderdate, o.status
ORDER BY o.orderdate DESC;
```

## Migrations Importantes

### Migration Géolocalisation

```ruby
class AddGeolocationToCommerces < ActiveRecord::Migration[6.0]
  def change
    add_column :commerces, :latitude, :decimal, precision: 10, scale: 6
    add_column :commerces, :longitude, :decimal, precision: 10, scale: 6
    
    add_index :commerces, [:latitude, :longitude]
  end
end
```

### Migration Statuts Commandes

```ruby
class ChangeOrderStatusToInteger < ActiveRecord::Migration[6.0]
  def up
    # Conversion string vers integer pour les enums Rails
    add_column :orders, :status_int, :integer, default: 0
    
    Order.reset_column_information
    Order.find_each do |order|
      status_mapping = {
        'Waiting' => 0, 'Accepted' => 1, 'In_Progress' => 2,
        'Shipped' => 3, 'Delivered' => 4, 'Completed' => 5, 'Cancelled' => 6
      }
      order.update_column(:status_int, status_mapping[order.status] || 0)
    end
    
    remove_column :orders, :status
    rename_column :orders, :status_int, :status
    
    add_index :orders, :status
  end
end
```
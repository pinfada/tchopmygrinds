# Documentation Base de Données - Relations

## Diagramme de Relations

```
                    ┌─────────────┐
                    │    users    │
                    │             │
                    │ id (PK)     │
                    │ email       │
                    │ name        │
                    │ statut_type │
                    │ seller_role │
                    │ buyer_role  │
                    │ admin       │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌─────────────┐ ┌─────────────┐
    │commerces │    │   orders    │ │  addresses  │
    │          │    │             │ │             │
    │id (PK)   │    │ id (PK)     │ │ id (PK)     │
    │nom       │    │ orderdate   │ │ street      │
    │ville     │    │ status      │ │ city        │
    │latitude  │    │ user_id(FK) │ │ user_id(FK) │
    │longitude │    └──────┬──────┘ └─────────────┘
    │user_id(FK)│           │
    └─────┬────┘           │
          │                ▼
          │         ┌─────────────┐
          │         │orderdetails │
          │         │             │
          │         │ id (PK)     │
          │         │ quantity    │
          │         │ unitprice   │
          │         │ order_id(FK)│
          │         │product_id(FK)│
          │         └──────┬──────┘
          │                │
          ▼                │
    ┌─────────────────┐    │
    │categorizations  │    │
    │                 │    │
    │ id (PK)         │    │
    │ commerce_id(FK) │    │
    │ product_id(FK)  │    │
    └─────────┬───────┘    │
              │            │
              ▼            ▼
         ┌─────────────┐   │
         │  products   │   │
         │             │   │
         │ id (PK)     │◄──┘
         │ nom         │
         │ unitprice   │
         │ unitsinstock│
         └─────────────┘
```

## Relations Détaillées

### User → Commerce (1:N)

**Type** : One-to-Many (Un utilisateur peut posséder plusieurs commerces)

```ruby
# User model
has_many :commerces, dependent: :destroy

# Commerce model  
belongs_to :user
```

**Contraintes** :
- Un commerce appartient obligatoirement à un utilisateur
- L'utilisateur doit avoir `seller_role: true`
- Cascade DELETE : si l'utilisateur est supprimé, ses commerces le sont aussi

**Requête SQL typique** :
```sql
-- Commerces d'un vendeur spécifique
SELECT c.* FROM commerces c 
WHERE c.user_id = ?;

-- Vendeurs ayant des commerces actifs
SELECT u.* FROM users u
JOIN commerces c ON u.id = c.user_id
WHERE u.seller_role = true
GROUP BY u.id;
```

### Commerce → Product (N:M via Categorization)

**Type** : Many-to-Many (Un commerce vend plusieurs produits, un produit peut être vendu par plusieurs commerces)

```ruby
# Commerce model
has_many :categorizations, dependent: :destroy
has_many :products, through: :categorizations

# Product model
has_many :categorizations, dependent: :destroy  
has_many :commerces, through: :categorizations

# Categorization model (table de liaison)
belongs_to :commerce
belongs_to :product
```

**Logique Métier** :
- Un produit (ex: "Tomates Bio") peut être vendu par plusieurs commerces
- Un commerce peut avoir un catalogue varié de produits
- La table `categorizations` gère cette relation many-to-many

**Requêtes SQL courantes** :
```sql
-- Produits d'un commerce donné
SELECT p.* FROM products p
JOIN categorizations cat ON p.id = cat.product_id
WHERE cat.commerce_id = ?;

-- Commerces vendant un produit spécifique
SELECT c.* FROM commerces c
JOIN categorizations cat ON c.id = cat.commerce_id  
WHERE cat.product_id = ?;

-- Produits disponibles dans un rayon géographique
SELECT DISTINCT p.* FROM products p
JOIN categorizations cat ON p.id = cat.product_id
JOIN commerces c ON cat.commerce_id = c.id
WHERE p.unitsinstock > 0
AND (6371 * acos(...)) <= 50; -- Rayon 50km
```

### User → Order (1:N)

**Type** : One-to-Many (Un utilisateur peut passer plusieurs commandes)

```ruby
# User model
has_many :orders, dependent: :destroy

# Order model
belongs_to :user
```

**Contraintes** :
- Une commande appartient obligatoirement à un utilisateur
- L'utilisateur doit avoir `buyer_role: true` (vérifié en logique métier)

**États de commande** :
```ruby
enum status: {
  "Waiting" => 0,      # En attente confirmation marchand
  "Accepted" => 1,     # Acceptée  
  "In_Progress" => 2,  # En préparation
  "Shipped" => 3,      # Expédiée
  "Delivered" => 4,    # Livrée
  "Completed" => 5,    # Terminée et payée  
  "Cancelled" => 6     # Annulée
}
```

### Order → OrderDetail (1:N)

**Type** : One-to-Many (Une commande contient plusieurs lignes de produits)

```ruby
# Order model
has_many :orderdetails, dependent: :destroy
has_many :products, through: :orderdetails

# OrderDetail model
belongs_to :order
belongs_to :product
```

**Logique Métier** :
- Chaque `OrderDetail` représente une ligne de commande (produit + quantité + prix)
- Le prix est fixé au moment de la commande (`unitprice` dans orderdetails)
- Une commande doit avoir au minimum une ligne

**Calculs** :
```ruby
# Total d'une commande
order.orderdetails.sum { |detail| detail.quantity * detail.unitprice }

# Nombre d'articles total
order.orderdetails.sum(:quantity)
```

### User → Address (1:N)

**Type** : One-to-Many (Un utilisateur peut avoir plusieurs adresses de livraison)

```ruby
# User model
has_many :addresses, dependent: :destroy

# Address model
belongs_to :user
```

**Fonctionnalités** :
- Adresses de livraison multiples par utilisateur
- Géocodage automatique (latitude/longitude)
- Utilisation pour calculer les frais de livraison

## Requêtes Complexes Cross-Relations

### Commandes d'un Marchand

```sql
-- Toutes les commandes concernant les produits d'un marchand
SELECT DISTINCT o.*, u.name as customer_name
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN orderdetails od ON o.id = od.order_id
JOIN products p ON od.product_id = p.id  
JOIN categorizations cat ON p.id = cat.product_id
JOIN commerces c ON cat.commerce_id = c.id
WHERE c.user_id = ? -- ID du marchand
ORDER BY o.orderdate DESC;
```

### Chiffre d'Affaires par Commerce

```sql
-- CA par commerce sur une période
SELECT c.nom, c.ville,
       COUNT(DISTINCT o.id) as nb_commandes,
       SUM(od.quantity * od.unitprice) as chiffre_affaires
FROM commerces c
JOIN categorizations cat ON c.id = cat.commerce_id
JOIN products p ON cat.product_id = p.id
JOIN orderdetails od ON p.id = od.product_id
JOIN orders o ON od.order_id = o.id
WHERE o.status IN (4, 5) -- Delivered ou Completed
  AND o.orderdate >= ?
  AND o.orderdate <= ?
GROUP BY c.id, c.nom, c.ville
ORDER BY chiffre_affaires DESC;
```

### Produits Populaires par Zone

```sql
-- Produits les plus commandés dans un rayon
SELECT p.nom, COUNT(*) as nb_commandes,
       SUM(od.quantity) as quantite_totale
FROM products p
JOIN orderdetails od ON p.id = od.product_id
JOIN orders o ON od.order_id = o.id
JOIN users u ON o.user_id = u.id
JOIN addresses a ON u.id = a.user_id
WHERE (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
       cos(radians(a.longitude) - radians(?)) + 
       sin(radians(?)) * sin(radians(a.latitude)))) <= ?
  AND o.status IN (4, 5) -- Commandes livrées
GROUP BY p.id, p.nom
ORDER BY nb_commandes DESC
LIMIT 10;
```

## Contraintes d'Intégrité

### Contraintes de Base

```sql
-- Clés étrangères avec contraintes
ALTER TABLE commerces ADD CONSTRAINT fk_commerces_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Contraintes Métier

```ruby
# Dans les modèles Rails - Validations custom
class Commerce < ApplicationRecord
  validate :user_must_be_seller
  
  private
  
  def user_must_be_seller
    unless user&.seller_role?
      errors.add(:user, "doit avoir le rôle vendeur")
    end
  end
end

class Order < ApplicationRecord  
  validate :user_must_be_buyer, :must_have_details
  
  private
  
  def user_must_be_buyer
    unless user&.buyer_role?
      errors.add(:user, "doit avoir le rôle acheteur") 
    end
  end
  
  def must_have_details
    if orderdetails.empty?
      errors.add(:orderdetails, "ne peut pas être vide")
    end
  end
end
```

## Optimisations des Relations

### Index Composites

```sql
-- Index pour les requêtes géolocalisées
CREATE INDEX idx_commerces_user_location ON commerces (user_id, latitude, longitude);

-- Index pour les recherches de produits par commerce  
CREATE INDEX idx_categorizations_commerce_product ON categorizations (commerce_id, product_id);

-- Index pour l'historique des commandes
CREATE INDEX idx_orders_user_date ON orders (user_id, orderdate DESC);

-- Index pour les détails de commande
CREATE INDEX idx_orderdetails_order_product ON orderdetails (order_id, product_id);
```

### Eager Loading (Rails)

```ruby
# Éviter le problème N+1 avec les relations
# Au lieu de :
commerces = Commerce.all
commerces.each { |c| puts c.user.name } # N+1 queries

# Utiliser :
commerces = Commerce.includes(:user)
commerces.each { |c| puts c.user.name } # 2 queries seulement

# Pour les relations complexes :
orders = Order.includes(
  :user,
  orderdetails: { product: { categorizations: :commerce } }
)
```

### Compteurs de Cache

```ruby
# Ajout de compteurs pour éviter les COUNT()
class Commerce < ApplicationRecord
  has_many :categorizations, dependent: :destroy
  has_many :products, through: :categorizations, counter_cache: :products_count
end

# Migration correspondante
add_column :commerces, :products_count, :integer, default: 0

# Mise à jour des compteurs existants
Commerce.find_each do |commerce|
  Commerce.update_counters commerce.id, products_count: commerce.products.count
end
```

## Gestion des Cascades

### Stratégies de Suppression

```ruby
class User < ApplicationRecord
  # Suppression des commerces si l'utilisateur est supprimé
  has_many :commerces, dependent: :destroy
  
  # Suppression des adresses  
  has_many :addresses, dependent: :destroy
  
  # RESTRICTION pour les commandes (historique à préserver)
  has_many :orders, dependent: :restrict_with_error
end

class Commerce < ApplicationRecord
  # Suppression des liens produits
  has_many :categorizations, dependent: :destroy
  
  # Les produits eux-mêmes ne sont pas supprimés
  # (ils peuvent être vendus par d'autres commerces)
end

class Order < ApplicationRecord
  # Suppression des détails avec la commande
  has_many :orderdetails, dependent: :destroy
end
```

Cette architecture relationnelle supporte efficacement :
- La géolocalisation des commerces
- La gestion multi-rôles des utilisateurs  
- Le catalogue de produits partagé
- Le workflow de commande complet
- L'historique et les statistiques
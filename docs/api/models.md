# Documentation API - Modèles de Données

## Vue d'ensemble des Relations

```
User (1) ←→ (N) Commerce (1) ←→ (N) Categorization (N) ←→ (1) Product
User (1) ←→ (N) Order (1) ←→ (N) OrderDetail (N) ←→ (1) Product  
User (1) ←→ (N) Address
```

## Modèle User

Modèle principal pour l'authentification et la gestion des utilisateurs.

### Attributs
```ruby
{
  id: Integer,
  email: String,
  encrypted_password: String,
  name: String,
  statut_type: Enum, # "itinerant", "sedentary", "others"
  seller_role: Boolean,
  buyer_role: Boolean, 
  admin: Boolean,
  status: Boolean, # Compte actif/inactif
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `has_many :commerces` - Commerces appartenant à l'utilisateur
- `has_many :orders` - Commandes passées par l'utilisateur
- `has_many :addresses` - Adresses de livraison

### Types d'Utilisateurs
- **itinerant**: Marchands mobiles (food trucks, marchés)
- **sedentary**: Marchands avec emplacement fixe (boutiques)
- **others**: Clients/acheteurs classiques

### Rôles
- **seller_role**: Peut créer et gérer des commerces/produits
- **buyer_role**: Peut passer des commandes
- **admin**: Accès à l'interface d'administration

## Modèle Commerce

Représente les boutiques/commerces des marchands.

### Attributs
```ruby
{
  id: Integer,
  nom: String,
  description: Text,
  adresse: String,
  ville: String,
  telephone: String,
  latitude: Float, # Géocodage automatique
  longitude: Float, # Géocodage automatique
  user_id: Integer, # Propriétaire du commerce
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `belongs_to :user` - Propriétaire du commerce
- `has_many :categorizations`
- `has_many :products, through: :categorizations`

### Fonctionnalités Géographiques
- Géocodage automatique à partir de l'adresse
- Recherche par proximité (rayon en km)
- Calcul de distance par rapport à une position

### Exemple JSON
```json
{
  "id": 1,
  "nom": "Épicerie Bio du Centre",
  "description": "Produits biologiques et locaux",
  "adresse": "45 Rue de la République",
  "ville": "Lyon",
  "telephone": "0472123456",
  "latitude": 45.7640,
  "longitude": 4.8357,
  "user_id": 2,
  "distance": 1.2 // Calculée dynamiquement
}
```

## Modèle Product

Catalogue des produits disponibles dans les commerces.

### Attributs
```ruby
{
  id: Integer,
  nom: String,
  description: Text,
  unitprice: Decimal(8,2), # Prix unitaire
  unitsinstock: Integer, # Stock disponible
  unitsonorder: Integer, # Quantité commandée (réapprovisionnement)
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `has_many :categorizations`
- `has_many :commerces, through: :categorizations`
- `has_many :orderdetails`

### Gestion du Stock
```ruby
# Méthodes utiles
product.available? # Stock > 0
product.low_stock? # Stock < seuil_minimum
product.total_ordered # Somme des commandes en cours
```

### Exemple JSON
```json
{
  "id": 1,
  "nom": "Tomates Cerises Bio",
  "description": "Tomates cerises biologiques, production locale",
  "unitprice": 4.50,
  "unitsinstock": 25,
  "unitsonorder": 0,
  "commerces": [
    {
      "id": 1,
      "nom": "Épicerie Bio",
      "distance": 1.2
    }
  ]
}
```

## Modèle Order

Gestion des commandes clients.

### Attributs
```ruby
{
  id: Integer,
  orderdate: DateTime,
  status: Enum, # Statuts de commande
  user_id: Integer, # Client
  created_at: DateTime,
  updated_at: DateTime
}
```

### Statuts de Commande
```ruby
enum status: {
  "Waiting" => 0,     # En attente de confirmation
  "Accepted" => 1,    # Acceptée par le marchand
  "In_Progress" => 2, # En préparation
  "Shipped" => 3,     # Expédiée
  "Delivered" => 4,   # Livrée
  "Completed" => 5,   # Terminée
  "Cancelled" => 6    # Annulée
}
```

### Relations
- `belongs_to :user` - Client qui a passé la commande
- `has_many :orderdetails`
- `has_many :products, through: :orderdetails`

### Méthodes Calculées
```ruby
order.total_amount # Montant total de la commande
order.items_count # Nombre d'articles
```

## Modèle OrderDetail

Détails des produits dans une commande (table de liaison).

### Attributs
```ruby
{
  id: Integer,
  quantity: Integer, # Quantité commandée
  unitprice: Decimal(8,2), # Prix au moment de la commande
  order_id: Integer,
  product_id: Integer,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `belongs_to :order`
- `belongs_to :product`

### Calculs
```ruby
orderdetail.subtotal # quantity * unitprice
```

## Modèle Address

Adresses de livraison des utilisateurs.

### Attributs
```ruby
{
  id: Integer,
  street: String,
  city: String,
  postal_code: String,
  country: String,
  latitude: Float, # Géocodage automatique
  longitude: Float, # Géocodage automatique
  user_id: Integer,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `belongs_to :user`

### Géolocalisation
- Géocodage automatique lors de la création/modification
- Utilisé pour calculer les distances de livraison

## Modèle Categorization

Table de liaison entre Commerce et Product (many-to-many).

### Attributs
```ruby
{
  id: Integer,
  commerce_id: Integer,
  product_id: Integer,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `belongs_to :commerce`
- `belongs_to :product`

## Newsletter

Gestion des inscriptions newsletter.

### Attributs
```ruby
{
  id: Integer,
  email: String,
  subscribed: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

## Validations Importantes

### User
- `email`: présent, unique, format valide
- `name`: présent
- Au moins un rôle doit être sélectionné

### Commerce  
- `nom`: présent
- `ville`: présent
- `user_id`: présent, doit être un seller

### Product
- `nom`: présent
- `unitprice`: présent, > 0
- `unitsinstock`: présent, >= 0

### Order
- `user_id`: présent
- Doit avoir au moins un OrderDetail

### Address
- `street`, `city`: présents
- `user_id`: présent
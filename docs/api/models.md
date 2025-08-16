# Documentation API - Modèles de Données

## Vue d'ensemble des Relations

```
User (1) ←→ (N) Commerce (1) ←→ (N) Categorization (N) ←→ (1) Product
User (1) ←→ (N) Order (1) ←→ (N) OrderDetail (N) ←→ (1) Product  
User (1) ←→ (N) Address
User (1) ←→ (N) ProductInterest
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
- `has_many :product_interests` - Manifestations d'intérêt exprimées

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
- `has_many :product_interests` - Manifestations d'intérêt pour ce produit

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

## Modèle ProductInterest

Système de manifestation d'intérêt pour les produits non disponibles ou en rupture de stock.

### Attributs
```ruby
{
  id: Integer,
  user_id: Integer, # Utilisateur qui manifeste l'intérêt
  product_name: String, # Nom du produit recherché
  message: Text, # Message optionnel (préférences, quantité, etc.)
  user_latitude: Decimal(10,6), # Position de l'utilisateur
  user_longitude: Decimal(10,6), # Position de l'utilisateur
  search_radius: Integer, # Rayon de recherche en km (défaut: 25)
  fulfilled: Boolean, # Intérêt satisfait (défaut: false)
  fulfilled_at: DateTime, # Date de satisfaction
  email_sent: Boolean, # Notification email envoyée (défaut: false)
  created_at: DateTime,
  updated_at: DateTime
}
```

### Relations
- `belongs_to :user` - Utilisateur qui a exprimé l'intérêt

### Scopes Disponibles
```ruby
# Intérêts actifs (non satisfaits)
ProductInterest.active

# Recherche dans une zone géographique
ProductInterest.in_area(latitude, longitude, radius)

# Recherche par nom de produit (insensible à la casse)
ProductInterest.for_product(product_name)
```

### Méthodes d'Instance
```ruby
# Marquer comme satisfait
product_interest.fulfill!

# Calculer la distance depuis des coordonnées
product_interest.distance_from(lat, lng)
```

### Fonctionnalités Principales

#### 1. Vérification Immédiate
Lors de la création d'une manifestation d'intérêt, le système vérifie automatiquement s'il existe des produits correspondants en stock dans la zone géographique spécifiée.

#### 2. Notifications Automatiques
- **Immédiate**: Email envoyé si des produits sont disponibles à la création
- **Différée**: Les marchands peuvent notifier manuellement la disponibilité

#### 3. Géolocalisation
- Stockage de la position de l'utilisateur
- Recherche par proximité géographique
- Calcul de distance avec formule Haversine

#### 4. Dashboard Marchand
Interface spécialisée pour que les marchands puissent :
- Voir les manifestations d'intérêt pour leurs produits
- Notifier la disponibilité quand ils ajoutent du stock
- Filtrer par distance et rayon

### Exemple JSON
```json
{
  "id": 1,
  "product_name": "Tomates Bio",
  "message": "Je recherche des tomates de qualité bio, environ 2kg",
  "user_latitude": 45.7640,
  "user_longitude": 4.8357,
  "search_radius": 25,
  "fulfilled": false,
  "fulfilled_at": null,
  "email_sent": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "user": {
    "id": 3,
    "name": "Marie Dubois",
    "email": "marie@example.com"
  }
}
```

### Workflow Complet
1. **Utilisateur** : Manifeste son intérêt pour un produit indisponible
2. **Système** : Vérifie immédiatement les stocks disponibles dans la zone
3. **Email automatique** : Envoyé si des produits correspondants sont trouvés
4. **Marchand** : Peut voir les demandes via son dashboard
5. **Notification manuelle** : Le marchand notifie quand il ajoute du stock
6. **Satisfaction** : L'intérêt est marqué comme satisfait

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

### ProductInterest
- `product_name`: présent
- `user_latitude`, `user_longitude`: présents (géolocalisation requise)
- `search_radius`: présent, > 0
- `user_id`: présent
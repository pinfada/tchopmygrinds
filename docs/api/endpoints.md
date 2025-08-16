# Documentation API - Endpoints

## Endpoints Principaux

### Authentification
Utilise Devise pour l'authentification utilisateur.

- `POST /users/sign_in` - Connexion utilisateur
- `DELETE /users/sign_out` - Déconnexion utilisateur  
- `POST /users` - Inscription utilisateur

### Pages & Utilitaires

#### `GET /`
Page d'accueil avec bootstrap de l'application AngularJS.

#### `GET /serveraddress`
Retourne l'adresse IP du serveur.
```json
{
  "ip": "192.168.1.100"
}
```

#### `GET /agrimer`
Endpoint pour les données Agrimer (données agricoles).

### Commerces

#### `GET /commerces`
Liste tous les commerces avec pagination.

**Paramètres:**
- `page` (optionnel) - Numéro de page

**Réponse:**
```json
[
  {
    "id": 1,
    "nom": "Commerce Local",
    "latitude": 45.7640,
    "longitude": 4.8357,
    "ville": "Lyon",
    "user_id": 2
  }
]
```

#### `GET /commerces/listcommerce`
**Endpoint principal** pour la recherche géolocalisée de commerces.

**Paramètres:**
- `latitude` (requis) - Latitude de l'utilisateur
- `longitude` (requis) - Longitude de l'utilisateur
- `distance` (optionnel, défaut: 50) - Rayon de recherche en km

**Exemple de requête:**
```
GET /commerces/listcommerce?latitude=45.7640&longitude=4.8357&distance=25
```

**Réponse:**
```json
[
  {
    "id": 1,
    "nom": "Épicerie du Coin",
    "latitude": 45.7650,
    "longitude": 4.8360,
    "ville": "Lyon",
    "distance": 0.15,
    "products_count": 25,
    "user": {
      "id": 2,
      "name": "Jean Dupont",
      "statut_type": "sedentary"
    }
  }
]
```

#### `POST /commerces`
Création d'un nouveau commerce (marchands uniquement).

**Body:**
```json
{
  "commerce": {
    "nom": "Mon Commerce",
    "adresse": "123 Rue Example",
    "ville": "Lyon",
    "telephone": "0123456789"
  }
}
```

#### `PUT /commerces/:id`
Mise à jour d'un commerce existant.

#### `DELETE /commerces/:id` 
Suppression d'un commerce (propriétaire uniquement).

### Produits

#### `GET /products`
Liste tous les produits avec filtres optionnels.

**Paramètres:**
- `commerce_id` (optionnel) - Filtrer par commerce
- `search` (optionnel) - Recherche textuelle
- `latitude` & `longitude` (optionnel) - Tri par proximité

**Réponse:**
```json
[
  {
    "id": 1,
    "nom": "Tomates Bio",
    "description": "Tomates fraîches biologiques",
    "unitprice": 3.50,
    "unitsinstock": 100,
    "unitsonorder": 0,
    "commerce_id": 1,
    "commerce_name": "Épicerie Bio",
    "distance": 2.3
  }
]
```

#### `POST /products`
Création d'un nouveau produit (marchands uniquement).

#### `PUT /products/:id`
Mise à jour d'un produit existant.

#### `DELETE /products/:id`
Suppression d'un produit.

### Commandes

#### `GET /orders`
Liste des commandes de l'utilisateur connecté.

**Réponse:**
```json
[
  {
    "id": 1,
    "orderdate": "2024-01-15T10:30:00Z",
    "status": "Waiting",
    "total_amount": 25.50,
    "user_id": 3,
    "orderdetails": [
      {
        "id": 1,
        "quantity": 2,
        "unitprice": 3.50,
        "product_name": "Tomates Bio"
      }
    ]
  }
]
```

#### `POST /orders`
Création d'une nouvelle commande.

**Body:**
```json
{
  "order": {
    "orderdetails_attributes": [
      {
        "product_id": 1,
        "quantity": 2,
        "unitprice": 3.50
      }
    ]
  }
}
```

#### `PUT /orders/:id`
Mise à jour du statut de commande (marchands uniquement).

**Statuts disponibles:**
- `Waiting` - En attente
- `Accepted` - Acceptée  
- `In_Progress` - En cours
- `Shipped` - Expédiée
- `Delivered` - Livrée
- `Completed` - Terminée
- `Cancelled` - Annulée

### Adresses

#### `GET /addresses`
Adresses de livraison de l'utilisateur connecté.

#### `POST /addresses` 
Ajout d'une nouvelle adresse.

**Body:**
```json
{
  "address": {
    "street": "123 Rue de la Paix",
    "city": "Lyon", 
    "postal_code": "69000",
    "country": "France"
  }
}
```

### Manifestations d'intérêt

#### `GET /api/v1/product_interests`
Liste des manifestations d'intérêt de l'utilisateur connecté.

**Paramètres:**
- `page` (optionnel) - Numéro de page (défaut: 1)
- `per_page` (optionnel) - Éléments par page (défaut: 10)

**Réponse:**
```json
{
  "product_interests": [
    {
      "id": 1,
      "product_name": "Tomates Bio",
      "message": "Je recherche des tomates de qualité bio",
      "search_radius": 25,
      "fulfilled": false,
      "fulfilled_at": null,
      "email_sent": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user_latitude": 45.7640,
      "user_longitude": 4.8357
    }
  ],
  "meta": {
    "current_page": 1,
    "next_page": null,
    "prev_page": null,
    "total_pages": 1,
    "total_count": 1,
    "per_page": 10
  }
}
```

#### `POST /api/v1/product_interests`
Création d'une nouvelle manifestation d'intérêt.

**Body:**
```json
{
  "product_interest": {
    "product_name": "Tomates Bio",
    "message": "Je recherche des tomates de qualité bio",
    "search_radius": 25
  },
  "latitude": 45.7640,
  "longitude": 4.8357
}
```

**Réponse:**
```json
{
  "product_interest": {
    "id": 1,
    "product_name": "Tomates Bio",
    "message": "Je recherche des tomates de qualité bio",
    "search_radius": 25,
    "fulfilled": false,
    "email_sent": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Manifestation d'intérêt enregistrée avec succès"
}
```

**Notes:**
- Vérifie immédiatement la disponibilité de produits correspondants
- Envoie un email automatique si des produits sont trouvés
- Position géographique requise pour le matching par proximité

#### `GET /api/v1/product_interests/:id`
Détails d'une manifestation d'intérêt spécifique.

#### `DELETE /api/v1/product_interests/:id`
Suppression d'une manifestation d'intérêt.

**Réponse:**
```json
{
  "message": "Manifestation d'intérêt supprimée"
}
```

#### `GET /api/v1/product_interests/for_merchant`
Dashboard des manifestations d'intérêt pour les marchands.

**Paramètres:**
- `page` (optionnel) - Numéro de page
- `per_page` (optionnel) - Éléments par page

**Réponse:**
```json
{
  "product_interests": [
    {
      "id": 1,
      "product_name": "Tomates Bio",
      "message": "Je recherche des tomates de qualité bio",
      "search_radius": 25,
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": 3,
        "name": "Marie Dubois",
        "email": "marie@example.com"
      },
      "distance": 12.5
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 1,
    "total_count": 1,
    "per_page": 10
  }
}
```

**Autorisation:** Marchands uniquement (`statut_type`: "itinerant" ou "sedentary")

#### `POST /api/v1/product_interests/:id/notify_availability`
Notification manuelle de disponibilité d'un produit.

**Paramètres URL:**
- `:id` - ID du produit disponible

**Body:**
```json
{
  "radius": 50
}
```

**Réponse:**
```json
{
  "message": "3 notifications envoyées",
  "interests_notified": 3
}
```

**Autorisation:** Marchands uniquement
**Note:** Envoie des emails aux utilisateurs ayant manifesté leur intérêt pour ce produit dans le rayon spécifié

### Utilisateurs

#### `GET /users`
Liste des utilisateurs (admin uniquement).

#### `PUT /users/:id`
Mise à jour du profil utilisateur.

#### `GET /users/:id`
Détails d'un utilisateur spécifique.

## Codes de Statut HTTP

- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé  
- `404` - Ressource non trouvée
- `422` - Entité non traitable (erreurs de validation)
- `500` - Erreur serveur interne

## Format des Erreurs

```json
{
  "errors": {
    "nom": ["ne peut pas être vide"],
    "email": ["n'est pas valide"]
  }
}
```

## Authentification API

Utilise les sessions Rails avec protection CSRF. Pour les requêtes AJAX, inclure le token CSRF dans l'en-tête `X-CSRF-Token`.
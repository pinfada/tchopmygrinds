# Documentation API - Authentification & Autorisation

## Système d'Authentification (Devise)

L'application utilise **Devise** pour la gestion complète de l'authentification utilisateur.

### Configuration Devise

#### Routes d'authentification
```ruby
# Disponibles automatiquement
POST   /users/sign_in      # Connexion
DELETE /users/sign_out     # Déconnexion  
POST   /users              # Inscription
GET    /users/sign_up      # Formulaire inscription
GET    /users/sign_in      # Formulaire connexion
POST   /users/password     # Mot de passe oublié
PUT    /users/password     # Réinitialisation mot de passe
```

#### Session Management
- Sessions basées sur cookies Rails
- Timeout automatique après inactivité
- Protection CSRF activée

### Inscription Utilisateur

#### Paramètres requis
```json
{
  "user": {
    "email": "user@example.com",
    "password": "motdepasse123",
    "password_confirmation": "motdepasse123", 
    "name": "Jean Dupont",
    "statut_type": "others", // "itinerant", "sedentary", "others"
    "seller_role": false,
    "buyer_role": true
  }
}
```

#### Validation des données
- **Email**: format valide, unique
- **Mot de passe**: minimum 6 caractères
- **Nom**: obligatoire
- **Au moins un rôle** (seller_role ou buyer_role) doit être sélectionné

### Connexion

#### Requête de connexion
```json
{
  "user": {
    "email": "user@example.com", 
    "password": "motdepasse123",
    "remember_me": true // Optionnel
  }
}
```

#### Réponse succès
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jean Dupont",
    "statut_type": "others",
    "seller_role": false,
    "buyer_role": true,
    "admin": false
  },
  "message": "Signed in successfully"
}
```

## Système d'Autorisation (CanCanCan)

L'application utilise **CanCanCan** pour la gestion granulaire des permissions.

### Rôles Utilisateur

#### Types de comptes
1. **Acheteurs** (`buyer_role: true`)
   - Peuvent passer des commandes
   - Gèrent leurs adresses de livraison
   - Consultent l'historique de commandes

2. **Vendeurs** (`seller_role: true`)  
   - Créent et gèrent leurs commerces
   - Ajoutent/modifient des produits
   - Gèrent les commandes reçues
   - Peuvent aussi être acheteurs

3. **Administrateurs** (`admin: true`)
   - Accès complet à RailsAdmin
   - Gestion de tous les utilisateurs
   - Modération du contenu

#### Types de marchands
- **Itinerant** (`statut_type: "itinerant"`): Marchands mobiles
- **Sedentary** (`statut_type: "sedentary"`): Boutiques fixes

### Permissions Détaillées

#### Commerce Management
```ruby
# Vendeurs peuvent:
can :create, Commerce
can :read, Commerce, user_id: user.id # Leurs commerces uniquement
can :update, Commerce, user_id: user.id
can :destroy, Commerce, user_id: user.id

# Tous peuvent lire les commerces publics
can :read, Commerce # Liste publique
can :listcommerce, Commerce # Recherche géolocalisée
```

#### Product Management  
```ruby
# Vendeurs peuvent gérer les produits de leurs commerces
can :create, Product
can :read, Product # Tous les produits publics
can :update, Product do |product|
  product.commerces.any? { |commerce| commerce.user_id == user.id }
end
can :destroy, Product do |product|
  product.commerces.any? { |commerce| commerce.user_id == user.id }
end
```

#### Order Management
```ruby
# Acheteurs 
can :create, Order
can :read, Order, user_id: user.id # Leurs commandes uniquement

# Vendeurs peuvent voir les commandes pour leurs produits
can :read, Order do |order|
  order.orderdetails.any? do |detail| 
    detail.product.commerces.any? { |c| c.user_id == user.id }
  end
end

can :update, Order do |order|
  # Seulement le statut, et seulement leurs commandes
  order.orderdetails.any? do |detail|
    detail.product.commerces.any? { |c| c.user_id == user.id }
  end
end
```

### Vérification des Permissions

#### Dans les contrôleurs
```ruby
class CommercesController < ApplicationController
  before_action :authenticate_user! # Devise
  load_and_authorize_resource # CanCanCan
  
  def create
    @commerce.user = current_user
    # CanCanCan vérifie automatiquement les permissions
  end
end
```

#### Gestion des erreurs d'autorisation
```ruby
# Application Controller
rescue_from CanCan::AccessDenied do |exception|
  respond_to do |format|
    format.json { render json: { error: "Accès refusé" }, status: 403 }
    format.html { redirect_to root_path, alert: exception.message }
  end
end
```

### Protection CSRF

#### Configuration
- Token CSRF requis pour toutes les requêtes non-GET
- Token inclus automatiquement dans les formulaires Rails
- Pour AJAX, inclure dans l'en-tête `X-CSRF-Token`

#### Récupération du token CSRF
```javascript
// AngularJS - dans app.js
angular.module('marketApp').config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = 
    $('meta[name=csrf-token]').attr('content');
}]);
```

### Sessions et Sécurité

#### Configuration session
- Expiration automatique après 30 minutes d'inactivité
- Cookie sécurisé en HTTPS
- Protection contre le session hijacking

#### Politique de mots de passe
- Minimum 6 caractères
- Pas de complexité imposée (peut être renforcée)
- Hachage avec bcrypt

### API Authentication Flow

#### 1. Inscription
```bash
POST /users
Content-Type: application/json

{
  "user": {
    "email": "nouveau@example.com",
    "password": "motdepasse123", 
    "password_confirmation": "motdepasse123",
    "name": "Nouvel Utilisateur",
    "buyer_role": true
  }
}
```

#### 2. Connexion
```bash
POST /users/sign_in
Content-Type: application/json

{
  "user": {
    "email": "nouveau@example.com",
    "password": "motdepasse123"
  }
}
```

#### 3. Utilisation des APIs
```bash
GET /commerces
Cookie: _session_id=abc123...
X-CSRF-Token: def456...
```

#### 4. Déconnexion
```bash
DELETE /users/sign_out
Cookie: _session_id=abc123...
X-CSRF-Token: def456...
```

### Gestion des Erreurs

#### Codes d'erreur courants
- `401 Unauthorized`: Non authentifié
- `403 Forbidden`: Non autorisé (permissions insuffisantes)
- `422 Unprocessable Entity`: Erreurs de validation

#### Format des erreurs
```json
{
  "error": "Vous devez être connecté pour accéder à cette page",
  "errors": {
    "email": ["n'est pas valide"],
    "password": ["ne peut pas être vide"]
  }
}
```
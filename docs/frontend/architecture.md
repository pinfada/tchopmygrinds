# Documentation Frontend - Architecture AngularJS

## Vue d'ensemble de l'Architecture

L'application frontend utilise **AngularJS 1.8** dans une architecture Single Page Application (SPA) intégrée à Rails via l'asset pipeline.

### Structure des Fichiers

```
app/assets/javascripts/
├── app.js.erb                 # Module principal et configuration
├── application.js             # Manifest des dépendances
├── Templates/                 # Templates HTML AngularJS
│   ├── main.html
│   ├── header.html.erb
│   ├── cart.html
│   └── modals/
└── partials/
    ├── controllers/           # Contrôleurs AngularJS
    ├── services/             # Services et factories
    ├── directives/           # Directives custom
    └── filters/              # Filtres custom
```

## Module Principal (app.js.erb)

### Configuration du module
```javascript
angular.module('marketApp', [
  'ngRoute',           // Routage SPA
  'ngResource',        // API REST
  'ui.bootstrap',      // Bootstrap components
  'ui-leaflet',        // Cartes Leaflet
  'ngCart',           // Panier d'achat  
  'ngGeolocation',    // Géolocalisation
  'templates',        // Templates précompilés
  'angularDevise'     // Authentification
])
```

### Configuration du routage
```javascript
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  
  $routeProvider
    .when('/', {
      templateUrl: 'Templates/main.html',
      controller: 'MainController'
    })
    .when('/search', {
      templateUrl: 'Templates/search.html', 
      controller: 'SearchController'
    })
    .when('/cart', {
      templateUrl: 'Templates/ngCart/cart.html',
      controller: 'CartController'
    })
    .when('/checkout', {
      templateUrl: 'Templates/ngCart/checkout.html',
      controller: 'CheckoutController'
    })
    .otherwise({
      redirectTo: '/'
    });
}])
```

### Configuration HTTP
```javascript
.config(['$httpProvider', function($httpProvider) {
  // Protection CSRF Rails
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = 
    $('meta[name=csrf-token]').attr('content');
    
  // Configuration des requêtes
  $httpProvider.defaults.headers.common['Accept'] = 'application/json';
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
}])
```

## Architecture des Contrôleurs

### Contrôleur Principal (MainController)
**Fichier**: `app/assets/partials/controllers/MainController.js.erb`

Responsabilités:
- Initialisation de la carte Leaflet
- Gestion de la géolocalisation utilisateur
- Recherche de commerces par proximité
- Interface principale de l'application

```javascript
angular.module('marketApp').controller('MainController', [
  '$scope', '$http', 'myCoordinates', 'myBoutiques', 'myMarkers',
  function($scope, $http, myCoordinates, myBoutiques, myMarkers) {
    // Initialisation de la carte
    $scope.center = { lat: 45.764, lng: 4.836, zoom: 13 };
    
    // Récupération position utilisateur
    myCoordinates.getPosition().then(function(position) {
      $scope.userLocation = position;
      $scope.searchNearbyCommerces();
    });
  }
]);
```

### Contrôleur d'En-tête (HeaderController)  
**Fichier**: `app/assets/partials/controllers/HeaderController.js.erb`

Responsabilités:
- Gestion du menu de navigation
- Affichage du statut de connexion
- Interface du panier d'achat
- Barre de recherche

### Contrôleurs Modaux
Chaque modal a son contrôleur dédié:

#### modalProduct.js
- Affichage détails produit
- Ajout au panier
- Gestion stock

#### modalCommercelist.js  
- Liste des commerces trouvés
- Filtrage par distance
- Navigation vers les produits

#### modalOrder.js
- Historique des commandes
- Suivi des statuts
- Détails de livraison

#### modalRegistration.js
- Inscription utilisateur
- Sélection du type de compte
- Validation des données

## Architecture des Services

### Service de Géolocalisation (location.js)
```javascript
angular.module('marketApp').service('myCoordinates', function($q, $geolocation) {
  return {
    getPosition: function() {
      return $geolocation.getCurrentPosition({
        timeout: 10000,
        maximumAge: 600000,
        enableHighAccuracy: true
      });
    },
    
    watchPosition: function(callback) {
      return $geolocation.watchPosition(callback);
    }
  };
});
```

### Service Commerce (boutique.js)
```javascript  
angular.module('marketApp').service('myBoutiques', function($http, $q) {
  return {
    findNearby: function(lat, lng, radius) {
      return $http.get('/commerces/listcommerce', {
        params: {
          latitude: lat,
          longitude: lng, 
          distance: radius || 50
        }
      });
    },
    
    getProducts: function(commerceId) {
      return $http.get('/products', {
        params: { commerce_id: commerceId }
      });
    }
  };
});
```

### Service Markers (markers.js)
Gestion des marqueurs sur la carte Leaflet:
```javascript
angular.module('marketApp').service('myMarkers', function() {
  var markers = {};
  
  return {
    addCommerce: function(commerce) {
      markers['commerce_' + commerce.id] = {
        lat: commerce.latitude,
        lng: commerce.longitude,
        message: commerce.nom,
        icon: commerceIcon
      };
    },
    
    addUserLocation: function(lat, lng) {
      markers.user = {
        lat: lat,
        lng: lng,
        icon: userIcon,
        focus: true
      };
    },
    
    getMarkers: function() {
      return markers;
    }
  };
});
```

## Système de Templates

### Templates Précompilés
Les templates HTML sont précompilés via `angular-rails-templates` pour de meilleures performances.

### Templates Principaux

#### main.html
Template principal avec:
- Carte Leaflet centralisée
- Barre de recherche géographique  
- Liste des commerces trouvés
- Boutons d'action (panier, profil)

#### header.html.erb
En-tête avec:
- Logo et navigation
- Indicateur de connexion
- Panier avec compteur d'articles
- Menu utilisateur

#### Modals Bootstrap
Tous les modals utilisent UI-Bootstrap:
- `myModalProduct.html` - Détails produit
- `myModalCommercelist.html` - Liste commerces
- `myModalOrder.html` - Commandes
- `myModalRegistration.html` - Inscription

## Intégration Cartographique

### Configuration Leaflet
```javascript
angular.extend($scope, {
  center: { lat: 45.764, lng: 4.836, zoom: 13 },
  markers: {},
  defaults: {
    tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 18,
    attribution: 'OpenStreetMap contributors'
  }
});
```

### Types de Marqueurs
- **User Location**: Position GPS de l'utilisateur
- **Commerces**: Emplacements des boutiques
- **Selected**: Commerce actuellement sélectionné

### Interactions Carte
- Clic sur marqueur → Ouverture modal commerce
- Recherche → Mise à jour des marqueurs
- Géolocalisation → Centrage automatique

## Gestion du Panier (ngCart)

### Configuration
```javascript
// Dans app.js
.config(['ngCartProvider', function(ngCartProvider) {
  ngCartProvider.setSettings({
    currency: '€',
    currencySymbol: '€',
    shipping: 0,
    tax: 0
  });
}])
```

### Utilisation dans les contrôleurs
```javascript
// Ajout au panier
$scope.addToCart = function(product) {
  ngCart.addItem(
    product.id,
    product.nom, 
    product.unitprice,
    1, // quantité
    product
  );
};

// État du panier
$scope.cartTotal = ngCart.getTotalItems();
$scope.cartAmount = ngCart.getSubTotal();
```

## Authentification Frontend

### Intégration avec Devise
```javascript
// Service de connexion
angular.module('marketApp').service('connexion', function($http, Auth) {
  return {
    login: function(credentials) {
      return Auth.login(credentials);
    },
    
    logout: function() {
      return Auth.logout();
    },
    
    isAuthenticated: function() {
      return Auth.isAuthenticated();
    }
  };
});
```

### Gestion des sessions
- État de connexion synchronisé avec Rails
- Redirection automatique si non authentifié
- Mise à jour de l'interface selon le rôle utilisateur

## Optimisations et Performances

### Asset Pipeline Rails
- Minification automatique en production
- Compilation des templates AngularJS
- Gestion des dépendances via Bower

### Lazy Loading
- Chargement différé des modals
- Templates mis en cache côté client
- Requêtes API optimisées avec mise en cache

### Responsive Design
- Bootstrap 3.4 pour l'adaptation mobile
- Cartes optimisées pour le touch
- Interface adaptée aux écrans tactiles
# Documentation Frontend - Composants AngularJS

## Contrôleurs Principaux

### MainController
**Fichier**: `app/assets/partials/controllers/MainController.js.erb`
**Template**: `Templates/main.html`

#### Responsabilités
- Interface principale de l'application
- Gestion de la carte Leaflet interactive
- Recherche géolocalisée des commerces
- Navigation entre les vues

#### Scope Variables
```javascript
$scope.center = { lat: 45.764, lng: 4.836, zoom: 13 }; // Centre de la carte
$scope.markers = {}; // Marqueurs sur la carte
$scope.commerces = []; // Liste des commerces trouvés
$scope.selectedCommerce = null; // Commerce sélectionné
$scope.userLocation = null; // Position de l'utilisateur
$scope.searchRadius = 50; // Rayon de recherche en km
```

#### Méthodes Principales
```javascript
// Recherche de commerces par proximité
$scope.searchNearbyCommerces = function() {
  if ($scope.userLocation) {
    myBoutiques.findNearby(
      $scope.userLocation.lat, 
      $scope.userLocation.lng, 
      $scope.searchRadius
    ).then(function(response) {
      $scope.commerces = response.data;
      $scope.updateMapMarkers();
    });
  }
};

// Ouverture modal détails commerce
$scope.showCommerceDetails = function(commerce) {
  $scope.selectedCommerce = commerce;
  $('#commerceModal').modal('show');
};

// Géolocalisation utilisateur
$scope.locateUser = function() {
  myCoordinates.getPosition().then(function(position) {
    $scope.userLocation = position;
    $scope.center.lat = position.lat;
    $scope.center.lng = position.lng;
    myMarkers.addUserLocation(position.lat, position.lng);
  });
};
```

### HeaderController  
**Fichier**: `app/assets/partials/controllers/HeaderController.js.erb`
**Template**: `Templates/header.html.erb`

#### Responsabilités
- Menu de navigation principal
- Gestion du panier d'achat
- Interface d'authentification
- Barre de recherche globale

#### Scope Variables
```javascript
$scope.currentUser = null; // Utilisateur connecté
$scope.cartItemsCount = 0; // Nombre d'articles dans le panier
$scope.searchQuery = ''; // Requête de recherche
$scope.isMenuOpen = false; // État du menu mobile
```

#### Méthodes d'Authentification
```javascript
// Ouverture modal connexion
$scope.showLoginModal = function() {
  $('#loginModal').modal('show');
};

// Déconnexion
$scope.logout = function() {
  connexion.logout().then(function() {
    $scope.currentUser = null;
    window.location.reload();
  });
};

// Vérification du statut de connexion
$scope.checkAuthStatus = function() {
  if (connexion.isAuthenticated()) {
    $scope.currentUser = connexion.currentUser();
  }
};
```

## Contrôleurs Modaux

### modalProduct.js
**Template**: `Templates/myModalProduct.html`

#### Fonctionnalités
- Affichage des détails d'un produit
- Gestion du stock disponible
- Ajout au panier avec quantité
- Informations sur le commerce vendeur

```javascript
angular.module('marketApp').controller('modalProductController', [
  '$scope', 'ngCart', function($scope, ngCart) {
    
    $scope.quantity = 1; // Quantité par défaut
    $scope.maxQuantity = 10; // Limite de quantité
    
    // Ajout au panier
    $scope.addToCart = function() {
      if ($scope.product && $scope.quantity > 0) {
        ngCart.addItem(
          $scope.product.id,
          $scope.product.nom,
          $scope.product.unitprice,
          $scope.quantity,
          {
            commerce_name: $scope.product.commerce_name,
            stock: $scope.product.unitsinstock
          }
        );
        $('#productModal').modal('hide');
      }
    };
    
    // Vérification du stock
    $scope.isOutOfStock = function() {
      return $scope.product && $scope.product.unitsinstock <= 0;
    };
    
    // Calcul du sous-total
    $scope.getSubtotal = function() {
      return $scope.product ? 
        ($scope.product.unitprice * $scope.quantity).toFixed(2) : 0;
    };
  }
]);
```

### modalCommercelist.js
**Template**: `Templates/myModalCommercelist.html`

#### Fonctionnalités
- Liste des commerces trouvés par géolocalisation
- Filtrage par distance et type
- Navigation vers les produits du commerce
- Affichage des informations de contact

```javascript
angular.module('marketApp').controller('modalCommercelistController', [
  '$scope', 'myBoutiques', function($scope, myBoutiques) {
    
    $scope.commerces = [];
    $scope.selectedCommerce = null;
    $scope.products = [];
    
    // Chargement des produits d'un commerce
    $scope.loadCommerceProducts = function(commerce) {
      $scope.selectedCommerce = commerce;
      
      myBoutiques.getProducts(commerce.id).then(function(response) {
        $scope.products = response.data;
      });
    };
    
    // Tri par distance
    $scope.sortByDistance = function() {
      $scope.commerces.sort(function(a, b) {
        return (a.distance || 0) - (b.distance || 0);
      });
    };
    
    // Filtrage par type de commerce
    $scope.filterByType = function(type) {
      return function(commerce) {
        return !type || commerce.user.statut_type === type;
      };
    };
  }
]);
```

### modalOrder.js
**Template**: `Templates/myModalOrder.html.erb`

#### Fonctionnalités
- Historique des commandes utilisateur
- Suivi des statuts de commande
- Détails des articles commandés
- Actions selon le statut

```javascript
angular.module('marketApp').controller('modalOrderController', [
  '$scope', '$http', 'orderdetail', function($scope, $http, orderdetail) {
    
    $scope.orders = [];
    $scope.selectedOrder = null;
    
    // Chargement des commandes
    $scope.loadOrders = function() {
      $http.get('/orders').then(function(response) {
        $scope.orders = response.data;
      });
    };
    
    // Affichage des détails de commande
    $scope.showOrderDetails = function(order) {
      $scope.selectedOrder = order;
      orderdetail.getOrderDetails(order.id).then(function(details) {
        $scope.selectedOrder.details = details;
      });
    };
    
    // Annulation de commande
    $scope.cancelOrder = function(order) {
      if (order.status === 'Waiting' || order.status === 'Accepted') {
        $http.put('/orders/' + order.id, {
          order: { status: 'Cancelled' }
        }).then(function() {
          order.status = 'Cancelled';
        });
      }
    };
    
    // Classes CSS selon le statut
    $scope.getStatusClass = function(status) {
      var classes = {
        'Waiting': 'label-warning',
        'Accepted': 'label-info', 
        'In_Progress': 'label-primary',
        'Shipped': 'label-success',
        'Delivered': 'label-success',
        'Completed': 'label-success',
        'Cancelled': 'label-danger'
      };
      return classes[status] || 'label-default';
    };
  }
]);
```

### modalRegistration.js
**Template**: `Templates/myModalRegistration.html`

#### Fonctionnalités
- Inscription de nouveaux utilisateurs
- Sélection du type de compte
- Validation des données
- Gestion des erreurs

```javascript
angular.module('marketApp').controller('modalRegistrationController', [
  '$scope', '$http', function($scope, $http) {
    
    $scope.user = {
      email: '',
      password: '',
      password_confirmation: '',
      name: '',
      statut_type: 'others',
      seller_role: false,
      buyer_role: true
    };
    
    $scope.errors = {};
    
    // Inscription
    $scope.register = function() {
      $http.post('/users', { user: $scope.user })
        .then(function(response) {
          $('#registrationModal').modal('hide');
          window.location.reload();
        })
        .catch(function(error) {
          $scope.errors = error.data.errors || {};
        });
    };
    
    // Validation côté client
    $scope.validateForm = function() {
      var valid = true;
      $scope.errors = {};
      
      if (!$scope.user.email) {
        $scope.errors.email = ['Email requis'];
        valid = false;
      }
      
      if ($scope.user.password !== $scope.user.password_confirmation) {
        $scope.errors.password = ['Les mots de passe ne correspondent pas'];
        valid = false;
      }
      
      return valid;
    };
    
    // Changement de type d'utilisateur
    $scope.updateUserType = function() {
      if ($scope.user.statut_type === 'others') {
        $scope.user.seller_role = false;
        $scope.user.buyer_role = true;
      } else {
        $scope.user.seller_role = true;
        $scope.user.buyer_role = true;
      }
    };
  }
]);
```

## Services Métier

### myCoordinates (location.js)
Service de géolocalisation utilisant l'API HTML5.

```javascript
angular.module('marketApp').service('myCoordinates', [
  '$q', '$geolocation', function($q, $geolocation) {
    
    return {
      // Position actuelle
      getPosition: function(options) {
        var opts = options || {
          timeout: 10000,
          maximumAge: 300000,
          enableHighAccuracy: true
        };
        
        return $geolocation.getCurrentPosition(opts);
      },
      
      // Surveillance de position
      watchPosition: function(callback, options) {
        return $geolocation.watchPosition(callback, null, options);
      },
      
      // Distance entre deux points
      calculateDistance: function(lat1, lng1, lat2, lng2) {
        var R = 6371; // Rayon de la Terre en km
        var dLat = this.toRad(lat2 - lat1);
        var dLon = this.toRad(lng2 - lng1);
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
                
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      },
      
      toRad: function(value) {
        return value * Math.PI / 180;
      }
    };
  }
]);
```

### myBoutiques (boutique.js)
Service pour les opérations sur les commerces.

```javascript
angular.module('marketApp').service('myBoutiques', [
  '$http', '$q', function($http, $q) {
    
    return {
      // Recherche par proximité
      findNearby: function(lat, lng, radius) {
        return $http.get('/commerces/listcommerce', {
          params: {
            latitude: lat,
            longitude: lng,
            distance: radius || 50
          }
        });
      },
      
      // Produits d'un commerce
      getProducts: function(commerceId) {
        return $http.get('/products', {
          params: { commerce_id: commerceId }
        });
      },
      
      // Détails d'un commerce
      getCommerceDetails: function(commerceId) {
        return $http.get('/commerces/' + commerceId);
      },
      
      // Recherche textuelle
      searchCommerces: function(query, lat, lng) {
        return $http.get('/commerces', {
          params: {
            search: query,
            latitude: lat,
            longitude: lng
          }
        });
      }
    };
  }
]);
```

## Directives Personnalisées

### ExpandDirective.js
Directive pour l'expansion/contraction de contenu.

```javascript
angular.module('marketApp').directive('expandable', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var maxHeight = attrs.maxHeight || 100;
      
      element.css({
        'max-height': maxHeight + 'px',
        'overflow': 'hidden',
        'transition': 'max-height 0.3s ease'
      });
      
      element.on('click', function() {
        if (element.hasClass('expanded')) {
          element.removeClass('expanded')
            .css('max-height', maxHeight + 'px');
        } else {
          element.addClass('expanded')
            .css('max-height', element[0].scrollHeight + 'px');
        }
      });
    }
  };
});
```

### numericOnly.js
Directive pour les champs numériques uniquement.

```javascript
angular.module('marketApp').directive('numericOnly', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      
      element.on('keypress', function(event) {
        var char = String.fromCharCode(event.which);
        if (!/[0-9\.]/.test(char)) {
          event.preventDefault();
        }
      });
      
      ngModel.$parsers.push(function(value) {
        if (value) {
          var cleanValue = value.replace(/[^0-9\.]/g, '');
          if (cleanValue !== value) {
            ngModel.$setViewValue(cleanValue);
            ngModel.$render();
          }
          return parseFloat(cleanValue) || 0;
        }
        return 0;
      });
    }
  };
});
```

## Filtres Personnalisés

### productFilter.js
Filtre pour la recherche de produits.

```javascript
angular.module('marketApp').filter('productFilter', function() {
  return function(products, searchText, commerce) {
    if (!products) return [];
    
    var filtered = products;
    
    // Filtre par commerce
    if (commerce) {
      filtered = filtered.filter(function(product) {
        return product.commerces.some(function(c) {
          return c.id === commerce.id;
        });
      });
    }
    
    // Filtre par texte
    if (searchText) {
      filtered = filtered.filter(function(product) {
        return product.nom.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
               product.description.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      });
    }
    
    return filtered;
  };
});
```

### searchFilter.js
Filtre pour la recherche de commerces.

```javascript
angular.module('marketApp').filter('searchFilter', function() {
  return function(commerces, searchText, filters) {
    if (!commerces) return [];
    
    var filtered = commerces;
    
    // Filtre par texte
    if (searchText) {
      filtered = filtered.filter(function(commerce) {
        return commerce.nom.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
               commerce.ville.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      });
    }
    
    // Filtre par distance
    if (filters && filters.maxDistance) {
      filtered = filtered.filter(function(commerce) {
        return !commerce.distance || commerce.distance <= filters.maxDistance;
      });
    }
    
    // Filtre par type
    if (filters && filters.type) {
      filtered = filtered.filter(function(commerce) {
        return commerce.user && commerce.user.statut_type === filters.type;
      });
    }
    
    return filtered;
  };
});
```
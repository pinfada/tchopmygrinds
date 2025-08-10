# Documentation Frontend - Géolocalisation et Cartographie

## Vue d'ensemble du Système

L'application utilise une combinaison de technologies pour fournir une expérience géolocalisée complète :

- **Leaflet.js** : Cartes interactives avec OpenStreetMap
- **ngGeolocation** : Service AngularJS pour la géolocalisation HTML5
- **UI-Leaflet** : Intégration AngularJS-Leaflet
- **Geocoder Rails** : Géocodage côté serveur

## Configuration Leaflet

### Initialisation de la Carte

```javascript
// Dans MainController.js.erb
angular.extend($scope, {
  // Centre par défaut (Lyon, France)
  center: {
    lat: 45.764,
    lng: 4.8357,
    zoom: 13
  },
  
  // Configuration de base
  defaults: {
    tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 18,
    minZoom: 8,
    attribution: '© OpenStreetMap contributors',
    zoomControl: true,
    scrollWheelZoom: true
  },
  
  // Marqueurs sur la carte
  markers: {},
  
  // Événements de la carte
  events: {
    map: {
      enable: ['click', 'moveend', 'zoomend'],
      logic: 'broadcast'
    }
  }
});
```

### Gestion des Couches (Layers)

```javascript
// Configuration des couches de base
$scope.layers = {
  baselayers: {
    osm: {
      name: 'OpenStreetMap',
      type: 'xyz',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      layerOptions: {
        attribution: '© OpenStreetMap contributors'
      }
    }
  },
  
  overlays: {
    commerces: {
      name: 'Commerces',
      type: 'group',
      visible: true
    },
    user: {
      name: 'Ma Position', 
      type: 'group',
      visible: true
    }
  }
};
```

## Système de Marqueurs

### Types de Marqueurs

#### Marqueur Utilisateur
```javascript
// Service myMarkers - Position de l'utilisateur
addUserLocation: function(lat, lng) {
  markers.user = {
    lat: lat,
    lng: lng,
    icon: {
      iconUrl: '/assets/user-location-icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    },
    message: "Votre position",
    focus: true,
    layer: 'user'
  };
  
  return markers.user;
}
```

#### Marqueurs Commerce
```javascript
addCommerce: function(commerce) {
  var iconUrl = '/assets/';
  
  // Icône selon le type de commerce
  switch(commerce.user.statut_type) {
    case 'itinerant':
      iconUrl += 'food-truck-icon.png';
      break;
    case 'sedentary':
      iconUrl += 'shop-icon.png'; 
      break;
    default:
      iconUrl += 'default-commerce-icon.png';
  }
  
  markers['commerce_' + commerce.id] = {
    lat: commerce.latitude,
    lng: commerce.longitude,
    icon: {
      iconUrl: iconUrl,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    },
    message: this.buildCommercePopup(commerce),
    layer: 'commerces',
    commerce: commerce // Données complètes
  };
  
  return markers['commerce_' + commerce.id];
}
```

### Messages Popup Personnalisés

```javascript
// Construction du popup pour un commerce
buildCommercePopup: function(commerce) {
  var popup = '<div class="commerce-popup">';
  popup += '<h5>' + commerce.nom + '</h5>';
  popup += '<p><i class="fa fa-map-marker"></i> ' + commerce.ville + '</p>';
  
  if (commerce.distance) {
    popup += '<p><i class="fa fa-road"></i> ' + commerce.distance.toFixed(1) + ' km</p>';
  }
  
  if (commerce.products_count > 0) {
    popup += '<p><i class="fa fa-shopping-bag"></i> ' + commerce.products_count + ' produits</p>';
  }
  
  popup += '<button class="btn btn-sm btn-primary" ng-click="showCommerceDetails(' + commerce.id + ')">';
  popup += 'Voir les produits</button>';
  popup += '</div>';
  
  return popup;
}
```

## Géolocalisation Utilisateur

### Service de Géolocalisation

```javascript
angular.module('marketApp').service('myCoordinates', [
  '$q', '$geolocation', '$timeout', function($q, $geolocation, $timeout) {
    
    var defaultOptions = {
      timeout: 15000,
      maximumAge: 300000, // 5 minutes de cache
      enableHighAccuracy: true
    };
    
    return {
      // Position actuelle avec gestion d'erreur
      getPosition: function(options) {
        var deferred = $q.defer();
        var opts = angular.extend({}, defaultOptions, options);
        
        $geolocation.getCurrentPosition(opts)
          .then(function(position) {
            var coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            
            deferred.resolve(coords);
          })
          .catch(function(error) {
            console.error('Erreur géolocalisation:', error);
            
            // Position par défaut si échec
            var defaultPosition = {
              lat: 45.764,
              lng: 4.8357,
              accuracy: null,
              isDefault: true
            };
            
            deferred.resolve(defaultPosition);
          });
          
        return deferred.promise;
      },
      
      // Surveillance de position
      watchPosition: function(callback, errorCallback, options) {
        var opts = angular.extend({}, defaultOptions, options);
        
        return $geolocation.watchPosition(
          function(position) {
            var coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            callback(coords);
          },
          errorCallback || function(error) {
            console.error('Erreur surveillance position:', error);
          },
          opts
        );
      }
    };
  }
]);
```

### Gestion des Permissions

```javascript
// Vérification des permissions géolocalisation
$scope.checkGeolocationPermission = function() {
  if (navigator.permissions) {
    navigator.permissions.query({name: 'geolocation'}).then(function(result) {
      switch(result.state) {
        case 'granted':
          $scope.geolocationStatus = 'granted';
          $scope.locateUser();
          break;
        case 'prompt':
          $scope.geolocationStatus = 'prompt';
          break;
        case 'denied':
          $scope.geolocationStatus = 'denied';
          $scope.showLocationDeniedMessage();
          break;
      }
    });
  } else {
    // Fallback pour navigateurs anciens
    $scope.locateUser();
  }
};

// Message si géolocalisation refusée
$scope.showLocationDeniedMessage = function() {
  $scope.locationMessage = {
    type: 'warning',
    text: 'Géolocalisation désactivée. Utilisation de la position par défaut (Lyon).'
  };
};
```

## Recherche Géographique

### Recherche par Proximité

```javascript
// Dans MainController - Recherche de commerces proches
$scope.searchNearbyCommerces = function(radius) {
  if (!$scope.userLocation) {
    console.error('Position utilisateur non disponible');
    return;
  }
  
  $scope.searchRadius = radius || 50; // Défaut 50km
  $scope.isLoading = true;
  
  myBoutiques.findNearby(
    $scope.userLocation.lat,
    $scope.userLocation.lng, 
    $scope.searchRadius
  ).then(function(response) {
    $scope.commerces = response.data;
    $scope.updateMapMarkers();
    $scope.centerMapOnResults();
    
  }).catch(function(error) {
    console.error('Erreur recherche commerces:', error);
    $scope.showError('Erreur lors de la recherche des commerces.');
    
  }).finally(function() {
    $scope.isLoading = false;
  });
};

// Centrage de la carte sur les résultats
$scope.centerMapOnResults = function() {
  if ($scope.commerces.length === 0) return;
  
  var group = new L.featureGroup();
  
  // Ajout de la position utilisateur
  if ($scope.userLocation) {
    group.addLayer(L.marker([$scope.userLocation.lat, $scope.userLocation.lng]));
  }
  
  // Ajout des commerces trouvés
  $scope.commerces.forEach(function(commerce) {
    group.addLayer(L.marker([commerce.latitude, commerce.longitude]));
  });
  
  // Zoom automatique pour englober tous les points
  leafletData.getMap().then(function(map) {
    map.fitBounds(group.getBounds().pad(0.1));
  });
};
```

### Recherche par Adresse

```javascript
// Service de géocodage d'adresses
angular.module('marketApp').service('geocodingService', [
  '$http', '$q', function($http, $q) {
    
    return {
      // Géocodage via API externe (Nominatim)
      geocodeAddress: function(address) {
        var deferred = $q.defer();
        
        $http.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: address,
            format: 'json',
            limit: 5,
            countrycodes: 'fr', // Limité à la France
            addressdetails: 1
          }
        }).then(function(response) {
          if (response.data && response.data.length > 0) {
            var results = response.data.map(function(item) {
              return {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                display_name: item.display_name,
                address: item.address
              };
            });
            deferred.resolve(results);
          } else {
            deferred.reject('Aucun résultat trouvé');
          }
        }).catch(function(error) {
          deferred.reject(error);
        });
        
        return deferred.promise;
      },
      
      // Géocodage inverse (coordonnées → adresse)
      reverseGeocode: function(lat, lng) {
        return $http.get('https://nominatim.openstreetmap.org/reverse', {
          params: {
            lat: lat,
            lon: lng,
            format: 'json',
            addressdetails: 1
          }
        }).then(function(response) {
          return response.data;
        });
      }
    };
  }
]);
```

## Interactions Utilisateur

### Événements de Carte

```javascript
// Gestion des clics sur la carte
$scope.$on('leafletDirectiveMap.click', function(event, args) {
  var clickedLat = args.leafletEvent.latlng.lat;
  var clickedLng = args.leafletEvent.latlng.lng;
  
  // Recherche de commerces autour du point cliqué
  $scope.searchAroundPoint(clickedLat, clickedLng);
});

// Gestion des clics sur marqueurs
$scope.$on('leafletDirectiveMarker.click', function(event, args) {
  var markerId = args.markerName;
  
  if (markerId.startsWith('commerce_')) {
    var commerceId = markerId.replace('commerce_', '');
    var commerce = $scope.getCommerceById(commerceId);
    $scope.showCommerceDetails(commerce);
  }
});

// Gestion du zoom
$scope.$on('leafletDirectiveMap.zoomend', function(event, args) {
  var zoom = args.leafletEvent.target.getZoom();
  
  // Ajustement du rayon de recherche selon le zoom
  if (zoom >= 15) {
    $scope.searchRadius = 5; // 5km pour zoom élevé
  } else if (zoom >= 12) {
    $scope.searchRadius = 25; // 25km pour zoom moyen
  } else {
    $scope.searchRadius = 50; // 50km pour zoom faible
  }
});
```

### Contrôles de Carte Personnalisés

```javascript
// Ajout de contrôles personnalisés
leafletData.getMap().then(function(map) {
  
  // Contrôle de géolocalisation
  L.Control.Locate = L.Control.extend({
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'leaflet-control-locate leaflet-bar leaflet-control');
      var button = L.DomUtil.create('a', '', container);
      button.innerHTML = '<i class="fa fa-crosshairs"></i>';
      button.title = 'Me localiser';
      
      L.DomEvent.on(button, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        $scope.locateUser();
      });
      
      return container;
    }
  });
  
  // Contrôle de recherche par rayon
  L.Control.RadiusSearch = L.Control.extend({
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'leaflet-control-radius leaflet-control');
      container.innerHTML = `
        <select id="radius-select">
          <option value="5">5 km</option>
          <option value="25">25 km</option>
          <option value="50" selected>50 km</option>
          <option value="100">100 km</option>
        </select>
      `;
      
      L.DomEvent.on(container, 'change', function(e) {
        var radius = parseInt(e.target.value);
        $scope.searchRadius = radius;
        $scope.searchNearbyCommerces();
      });
      
      return container;
    }
  });
  
  // Ajout des contrôles à la carte
  map.addControl(new L.Control.Locate({ position: 'topleft' }));
  map.addControl(new L.Control.RadiusSearch({ position: 'topright' }));
});
```

## Optimisations et Performance

### Clustering des Marqueurs

```javascript
// Utilisation de MarkerCluster pour les nombreux marqueurs
leafletData.getMap().then(function(map) {
  var markers = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });
  
  $scope.commerces.forEach(function(commerce) {
    var marker = L.marker([commerce.latitude, commerce.longitude])
      .bindPopup(buildCommercePopup(commerce));
    markers.addLayer(marker);
  });
  
  map.addLayer(markers);
});
```

### Cache des Positions

```javascript
// Cache des positions récentes
angular.module('marketApp').service('positionCache', function() {
  var cache = {};
  var CACHE_DURATION = 300000; // 5 minutes
  
  return {
    set: function(key, position) {
      cache[key] = {
        data: position,
        timestamp: Date.now()
      };
    },
    
    get: function(key) {
      var cached = cache[key];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
      }
      return null;
    },
    
    clear: function() {
      cache = {};
    }
  };
});
```
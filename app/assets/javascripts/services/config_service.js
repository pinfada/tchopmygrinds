// Service de configuration pour remplacer les références ERB
angular.module('marketApp').service('ConfigService', function() {
  
  var self = this;
  
  // Configuration des assets (remplace les asset_path d'ERB)
  self.assets = {
    images: {
      logo: '/assets/logo.png',
      noAvatar: '/assets/no_ava.png',
      avatar1: '/assets/ava1.png'
    },
    templates: {
      main: '/assets/Templates/main.html',
      header: '/assets/Templates/header.html',
      cart: '/assets/Templates/cart.html',
      checkout: '/assets/Templates/checkout.html',
      fail: '/assets/Templates/fail.html',
      merchantInterests: '/assets/Templates/merchant_interests.html',
      mainTailwind: '/assets/Templates/main-tailwind.html'
    }
  };
  
  // Configuration de l'application
  self.app = {
    name: 'TchopMyGrinds',
    version: '2.0',
    api: {
      baseUrl: window.location.origin,
      version: 'v1'
    }
  };
  
  // Configuration de géolocalisation
  self.geolocation = {
    defaultRadius: 50, // km
    maxRadius: 100,
    options: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }
  };
  
  // Configuration de recherche
  self.search = {
    debounceTime: 500, // ms
    minQueryLength: 2,
    maxSuggestions: 10,
    popularProducts: [
      'Banane plantain',
      'Tomate',
      'Oignon',
      'Pomme de terre',
      'Carotte',
      'Haricot vert'
    ]
  };
  
  // Configuration de pagination
  self.pagination = {
    defaultPerPage: 20,
    maxPerPage: 100,
    pageSizes: [10, 20, 50, 100]
  };
  
  // Méthode pour obtenir une URL d'asset
  self.getAssetUrl = function(category, name) {
    if (self.assets[category] && self.assets[category][name]) {
      return self.assets[category][name];
    }
    console.warn('Asset not found:', category, name);
    return '';
  };
  
  // Méthode pour obtenir une URL d'image
  self.getImageUrl = function(imageName) {
    return self.getAssetUrl('images', imageName);
  };
  
  // Méthode pour obtenir une URL de template
  self.getTemplateUrl = function(templateName) {
    return self.getAssetUrl('templates', templateName);
  };
  
  // Configuration des endpoints API
  self.api = {
    commerces: {
      list: '/commerces',
      listNearby: '/commerces/listcommerce',
      search: '/commerces/search'
    },
    products: {
      list: '/products',
      listNearby: '/products/listcommerce',
      searchNearby: '/products/search_nearby'
    },
    orders: {
      list: '/orders',
      create: '/orders'
    },
    auth: {
      signIn: '/users/sign_in',
      signUp: '/users/sign_up',
      signOut: '/users/sign_out'
    }
  };
  
  // Méthode pour construire une URL d'API
  self.getApiUrl = function(endpoint, params) {
    var url = self.app.api.baseUrl + endpoint;
    if (params) {
      var queryString = Object.keys(params)
        .filter(function(key) { return params[key] != null; })
        .map(function(key) { return key + '=' + encodeURIComponent(params[key]); })
        .join('&');
      if (queryString) {
        url += '?' + queryString;
      }
    }
    return url;
  };
  
});
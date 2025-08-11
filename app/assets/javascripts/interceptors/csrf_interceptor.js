// CSRF Token Interceptor pour AngularJS
// Ajoute automatiquement le token CSRF à tous les appels HTTP
angular.module('marketApp').factory('CSRFTokenInterceptor', ['$q', function($q) {
  
  // Fonction pour récupérer le token CSRF depuis les meta tags
  function getCSRFToken() {
    var token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : null;
  }

  return {
    request: function(config) {
      // Ajouter le token CSRF pour les requêtes non-GET
      if (config.method !== 'GET') {
        var token = getCSRFToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers['X-CSRF-Token'] = token;
        }
      }
      return config;
    },

    requestError: function(rejection) {
      return $q.reject(rejection);
    },

    response: function(response) {
      return response;
    },

    responseError: function(rejection) {
      // Gestion spéciale des erreurs CSRF
      if (rejection.status === 422 && rejection.data && rejection.data.error === 'Invalid CSRF token') {
        console.warn('Token CSRF invalide - rechargement de la page recommandé');
        // Optionnel: notification à l'utilisateur ou rechargement automatique
      }
      return $q.reject(rejection);
    }
  };
}]);

// Configuration de l'intercepteur
angular.module('marketApp').config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('CSRFTokenInterceptor');
}]);
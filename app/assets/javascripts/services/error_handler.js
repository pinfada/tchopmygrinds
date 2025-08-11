// Service de gestion d'erreurs standardisé pour AngularJS
angular.module('marketApp').service('ErrorHandlerService', ['$log', function($log) {
  
  var self = this;
  
  // Types d'erreurs
  self.ERROR_TYPES = {
    NETWORK: 'network',
    VALIDATION: 'validation',
    AUTHORIZATION: 'authorization',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    UNKNOWN: 'unknown'
  };
  
  // Déterminer le type d'erreur depuis la réponse HTTP
  self.getErrorType = function(response) {
    if (!response) return self.ERROR_TYPES.UNKNOWN;
    
    switch(response.status) {
      case 0:
      case -1:
        return self.ERROR_TYPES.NETWORK;
      case 401:
      case 403:
        return self.ERROR_TYPES.AUTHORIZATION;
      case 404:
        return self.ERROR_TYPES.NOT_FOUND;
      case 422:
        return self.ERROR_TYPES.VALIDATION;
      case 500:
      case 502:
      case 503:
        return self.ERROR_TYPES.SERVER;
      default:
        return self.ERROR_TYPES.UNKNOWN;
    }
  };
  
  // Extraire le message d'erreur depuis la réponse
  self.getErrorMessage = function(response) {
    if (!response) return "Une erreur inconnue s'est produite";
    
    // Nouvelle structure API avec success/error
    if (response.data && response.data.error && response.data.error.message) {
      return response.data.error.message;
    }
    
    // Structure legacy ou autres formats
    if (response.data && typeof response.data === 'string') {
      return response.data;
    }
    
    if (response.data && response.data.message) {
      return response.data.message;
    }
    
    // Messages par défaut selon le status
    switch(response.status) {
      case 0:
      case -1:
        return "Problème de connexion réseau";
      case 401:
        return "Vous devez vous connecter pour accéder à cette ressource";
      case 403:
        return "Vous n'avez pas l'autorisation d'accéder à cette ressource";
      case 404:
        return "Ressource non trouvée";
      case 422:
        return "Données invalides";
      case 500:
        return "Erreur interne du serveur";
      case 502:
      case 503:
        return "Service temporairement indisponible";
      default:
        return "Une erreur s'est produite (Code: " + response.status + ")";
    }
  };
  
  // Extraire les détails d'erreur (pour validation par exemple)
  self.getErrorDetails = function(response) {
    if (!response || !response.data) return null;
    
    // Nouvelle structure API
    if (response.data.error && response.data.error.details) {
      return response.data.error.details;
    }
    
    // Structure legacy
    if (response.data.errors) {
      return response.data.errors;
    }
    
    return null;
  };
  
  // Gérer une erreur de manière standardisée
  self.handleError = function(response, context) {
    var errorType = self.getErrorType(response);
    var message = self.getErrorMessage(response);
    var details = self.getErrorDetails(response);
    
    var errorInfo = {
      type: errorType,
      message: message,
      details: details,
      status: response ? response.status : 0,
      context: context || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    // Logger l'erreur
    $log.error('API Error:', errorInfo);
    
    // Retourner les informations formatées
    return errorInfo;
  };
  
  // Vérifier si une réponse est un succès (nouvelle structure API)
  self.isSuccess = function(response) {
    return response && 
           response.data && 
           response.data.success === true;
  };
  
  // Extraire les données depuis une réponse réussie
  self.extractData = function(response) {
    if (self.isSuccess(response)) {
      return response.data.data;
    }
    
    // Fallback pour ancienne structure
    return response.data;
  };
  
  // Extraire les métadonnées (pagination, etc.)
  self.extractMeta = function(response) {
    if (self.isSuccess(response) && response.data.meta) {
      return response.data.meta;
    }
    
    return {};
  };
  
}]);
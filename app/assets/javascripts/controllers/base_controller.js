// Contrôleur de base pour partager des fonctionnalités communes
angular.module('marketApp').controller('BaseController', ['$scope', 'ConfigService', 'ErrorHandlerService', 
function($scope, ConfigService, ErrorHandlerService) {
  
  // Méthode pour obtenir les URLs d'images (disponible dans tous les templates)
  $scope.getImageUrl = function(imageName) {
    return ConfigService.getImageUrl(imageName);
  };
  
  // Méthode pour obtenir les URLs de templates
  $scope.getTemplateUrl = function(templateName) {
    return ConfigService.getTemplateUrl(templateName);
  };
  
  // Méthode pour construire les URLs d'API
  $scope.getApiUrl = function(endpoint, params) {
    return ConfigService.getApiUrl(endpoint, params);
  };
  
  // Configuration accessible
  $scope.appConfig = ConfigService;
  
  // Gestion d'erreur standardisée
  $scope.handleApiError = function(response, context) {
    return ErrorHandlerService.handleError(response, context);
  };
  
  // Méthode pour extraire les données de réponse API
  $scope.extractApiData = function(response) {
    return ErrorHandlerService.extractData(response);
  };
  
  // Méthode pour extraire les métadonnées (pagination, etc.)
  $scope.extractApiMeta = function(response) {
    return ErrorHandlerService.extractMeta(response);
  };
  
  // Vérifier si une réponse API est un succès
  $scope.isApiSuccess = function(response) {
    return ErrorHandlerService.isSuccess(response);
  };
  
}]);
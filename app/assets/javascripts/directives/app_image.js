// Directive pour gérer les images d'application
angular.module('marketApp').directive('appImage', ['ConfigService', function(ConfigService) {
  return {
    restrict: 'A',
    scope: {
      appImage: '@',
      alt: '@'
    },
    link: function(scope, element, attrs) {
      // Observer les changements de l'attribut app-image
      attrs.$observe('appImage', function(imageName) {
        if (imageName) {
          var imageUrl = ConfigService.getImageUrl(imageName);
          if (imageUrl) {
            element.attr('src', imageUrl);
          }
        }
      });
      
      // Gérer l'attribut alt
      if (scope.alt) {
        element.attr('alt', scope.alt);
      }
      
      // Gestion d'erreur de chargement d'image
      element.on('error', function() {
        console.warn('Image not found:', scope.appImage);
        // Utiliser une image par défaut
        var defaultImage = ConfigService.getImageUrl('noAvatar');
        if (defaultImage) {
          element.attr('src', defaultImage);
        }
      });
    }
  };
}]);
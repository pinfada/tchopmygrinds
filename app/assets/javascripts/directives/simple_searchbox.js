// Directive de recherche simple pour remplacer angular-advanced-searchbox
angular.module('marketApp').directive('simpleSearchbox', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      ngModel: '=',
      parameters: '=',
      placeholder: '@'
    },
    template: `
      <div class="simple-searchbox">
        <input type="text" 
               class="form-control search-input" 
               ng-model="searchQuery"
               placeholder="{{placeholder || 'Rechercher...'}}"
               ng-keydown="keydown($event)"
               ng-focus="showSuggestions = true"
               ng-blur="hideSuggestions()"
               autocomplete="off">
        
        <div class="suggestions-dropdown" ng-show="showSuggestions && filteredParameters.length">
          <div class="suggestion-item" 
               ng-repeat="param in filteredParameters track by $index"
               ng-click="selectParameter(param)"
               ng-class="{'selected': $index === selectedIndex}">
            <span class="param-name">{{param.name}}</span>
            <small class="param-type" ng-if="param.type">{{param.type}}</small>
          </div>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      scope.searchQuery = '';
      scope.showSuggestions = false;
      scope.selectedIndex = -1;
      scope.filteredParameters = [];
      
      // Surveiller les changements de searchQuery
      scope.$watch('searchQuery', function(newVal) {
        if (!newVal) {
          scope.filteredParameters = [];
          scope.ngModel = [];
          return;
        }
        
        // Filtrer les paramètres disponibles
        if (scope.parameters && scope.parameters.length) {
          scope.filteredParameters = scope.parameters.filter(function(param) {
            return param.name && param.name.toLowerCase().indexOf(newVal.toLowerCase()) !== -1;
          }).slice(0, 10); // Limiter à 10 suggestions
        }
      });
      
      // Gestion du clavier
      scope.keydown = function(event) {
        switch(event.keyCode) {
          case 40: // Flèche bas
            event.preventDefault();
            scope.selectedIndex = Math.min(scope.selectedIndex + 1, scope.filteredParameters.length - 1);
            break;
            
          case 38: // Flèche haut
            event.preventDefault();
            scope.selectedIndex = Math.max(scope.selectedIndex - 1, -1);
            break;
            
          case 13: // Enter
            event.preventDefault();
            if (scope.selectedIndex >= 0 && scope.filteredParameters[scope.selectedIndex]) {
              scope.selectParameter(scope.filteredParameters[scope.selectedIndex]);
            }
            break;
            
          case 27: // Escape
            scope.showSuggestions = false;
            scope.selectedIndex = -1;
            break;
        }
      };
      
      // Sélectionner un paramètre
      scope.selectParameter = function(parameter) {
        if (!scope.ngModel) {
          scope.ngModel = [];
        }
        
        // Ajouter le paramètre s'il n'existe pas déjà
        var exists = scope.ngModel.some(function(item) {
          return item.name === parameter.name;
        });
        
        if (!exists) {
          scope.ngModel.push({
            name: parameter.name,
            value: parameter.value || '',
            type: parameter.type || 'text'
          });
        }
        
        scope.searchQuery = '';
        scope.showSuggestions = false;
        scope.selectedIndex = -1;
      };
      
      // Cacher les suggestions avec un délai pour permettre les clics
      scope.hideSuggestions = function() {
        $timeout(function() {
          scope.showSuggestions = false;
          scope.selectedIndex = -1;
        }, 200);
      };
    }
  };
}]);
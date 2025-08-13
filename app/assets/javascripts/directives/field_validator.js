// Directive pour validation en temps réel des champs
angular.module('marketApp').directive('fieldValidator', ['ValidationService', '$timeout', function(ValidationService, $timeout) {
  return {
    restrict: 'A',
    scope: {
      fieldValidator: '=', // Règles de validation
      validationName: '@', // Nom du champ pour la validation
      onValidation: '&'    // Callback de validation
    },
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      var validationTimeout;
      
      // Fonction de validation
      function validateField() {
        var value = ngModelController.$viewValue;
        var fieldName = scope.validationName || attrs.name || 'field';
        
        if (scope.fieldValidator) {
          var validationResult = ValidationService.validateField(fieldName, value, scope.fieldValidator);
          
          // Mettre à jour la validité du modèle
          ngModelController.$setValidity('custom', validationResult.valid);
          
          // Ajouter/retirer les classes CSS
          element.toggleClass('is-invalid', !validationResult.valid);
          element.toggleClass('is-valid', validationResult.valid && value);
          
          // Gérer l'affichage des erreurs
          updateErrorDisplay(validationResult.errors);
          
          // Appeler le callback si défini
          if (scope.onValidation) {
            scope.onValidation({
              field: fieldName,
              valid: validationResult.valid,
              errors: validationResult.errors,
              value: value
            });
          }
          
          return validationResult.valid;
        }
        
        return true;
      }
      
      // Mettre à jour l'affichage des erreurs
      function updateErrorDisplay(errors) {
        // Supprimer les messages d'erreur existants
        var existingErrors = element.siblings('.field-error');
        existingErrors.remove();
        
        // Ajouter les nouveaux messages d'erreur
        if (errors && errors.length > 0) {
          errors.forEach(function(error) {
            var errorElement = angular.element('<div class="field-error text-danger small mt-1">' + error.message + '</div>');
            element.after(errorElement);
          });
        }
      }
      
      // Validation lors de la perte de focus
      element.on('blur', function() {
        scope.$apply(function() {
          validateField();
        });
      });
      
      // Validation différée lors de la saisie
      element.on('input', function() {
        if (validationTimeout) {
          $timeout.cancel(validationTimeout);
        }
        
        validationTimeout = $timeout(function() {
          validateField();
        }, 500); // Attendre 500ms après la dernière saisie
      });
      
      // Validation lors du changement de modèle
      scope.$watch('fieldValidator', function() {
        if (ngModelController.$viewValue) {
          validateField();
        }
      }, true);
      
      // Nettoyage
      scope.$on('$destroy', function() {
        if (validationTimeout) {
          $timeout.cancel(validationTimeout);
        }
        element.off('blur input');
      });
    }
  };
}]);

// Directive pour afficher les erreurs de formulaire
angular.module('marketApp').directive('formErrors', function() {
  return {
    restrict: 'E',
    scope: {
      errors: '=',
      showSummary: '=?'
    },
    template: `
      <div ng-show="errors && errors.length" class="alert alert-danger">
        <div ng-if="showSummary !== false">
          <strong><i class="fa fa-exclamation-triangle"></i> Erreurs de validation :</strong>
        </div>
        <ul class="mb-0 mt-2" ng-if="showSummary !== false">
          <li ng-repeat="error in errors">{{error.message}}</li>
        </ul>
        <div ng-if="showSummary === false">
          <span ng-repeat="error in errors">
            {{error.message}}<span ng-if="!$last">, </span>
          </span>
        </div>
      </div>
    `
  };
});

// Service pour gérer les validations de formulaire
angular.module('marketApp').service('FormValidationService', ['ValidationService', function(ValidationService) {
  var self = this;
  
  // Créer un objet de gestion de validation pour un formulaire
  self.createFormValidator = function(validationSchema) {
    return {
      schema: validationSchema,
      errors: [],
      fieldErrors: {},
      isValid: true,
      
      // Valider tout le formulaire
      validate: function(formData) {
        var result = ValidationService.validateObject(formData, this.schema);
        
        this.isValid = result.valid;
        this.errors = result.errors;
        this.fieldErrors = result.fieldErrors;
        
        return result;
      },
      
      // Valider un champ spécifique
      validateField: function(fieldName, value) {
        var fieldRules = this.schema[fieldName];
        var result = ValidationService.validateField(fieldName, value, fieldRules);
        
        if (result.valid) {
          delete this.fieldErrors[fieldName];
        } else {
          this.fieldErrors[fieldName] = result.errors;
        }
        
        // Recalculer la validité globale
        this.isValid = Object.keys(this.fieldErrors).length === 0;
        
        return result;
      },
      
      // Nettoyer les erreurs
      clearErrors: function() {
        this.errors = [];
        this.fieldErrors = {};
        this.isValid = true;
      },
      
      // Obtenir les erreurs pour un champ
      getFieldErrors: function(fieldName) {
        return this.fieldErrors[fieldName] || [];
      },
      
      // Vérifier si un champ a des erreurs
      hasFieldErrors: function(fieldName) {
        return this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0;
      }
    };
  };
  
  // Créer des validateurs prédéfinis
  self.createProductValidator = function() {
    return self.createFormValidator(ValidationService.schemas.product);
  };
  
  self.createCommerceValidator = function() {
    return self.createFormValidator(ValidationService.schemas.commerce);
  };
  
  self.createUserValidator = function() {
    return self.createFormValidator(ValidationService.schemas.user);
  };
  
  self.createSearchValidator = function() {
    return self.createFormValidator(ValidationService.schemas.search);
  };
}]);
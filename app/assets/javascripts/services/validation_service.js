// Service de validation côté client avec messages cohérents
angular.module('marketApp').service('ValidationService', ['ErrorHandlerService', function(ErrorHandlerService) {
  
  var self = this;
  
  // Règles de validation
  self.rules = {
    required: function(value) {
      return value !== null && value !== undefined && value !== '';
    },
    
    email: function(value) {
      if (!value) return true; // Optionnel si pas required
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    
    minLength: function(value, minLength) {
      if (!value) return true; // Optionnel si pas required
      return value.length >= minLength;
    },
    
    maxLength: function(value, maxLength) {
      if (!value) return true; // Optionnel si pas required
      return value.length <= maxLength;
    },
    
    numeric: function(value) {
      if (!value) return true; // Optionnel si pas required
      return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    positive: function(value) {
      if (!value) return true; // Optionnel si pas required
      return parseFloat(value) > 0;
    },
    
    coordinates: function(value) {
      if (!value) return true; // Optionnel si pas required
      var coord = parseFloat(value);
      return !isNaN(coord) && coord >= -180 && coord <= 180;
    },
    
    password: function(value) {
      if (!value) return true; // Optionnel si pas required
      // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
      var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(value);
    }
  };
  
  // Messages d'erreur standardisés
  self.messages = {
    required: "Ce champ est requis",
    email: "Format d'email invalide",
    minLength: "Minimum {min} caractères requis",
    maxLength: "Maximum {max} caractères autorisés",
    numeric: "Veuillez entrer un nombre valide",
    positive: "La valeur doit être positive",
    coordinates: "Coordonnées invalides (-180 à 180)",
    password: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
  };
  
  // Valider un champ selon des règles définies
  self.validateField = function(fieldName, value, validationRules) {
    var errors = [];
    
    if (!validationRules) return { valid: true, errors: [] };
    
    // Vérifier chaque règle
    Object.keys(validationRules).forEach(function(ruleName) {
      var ruleValue = validationRules[ruleName];
      var ruleFunction = self.rules[ruleName];
      
      if (!ruleFunction) {
        console.warn('Règle de validation inconnue:', ruleName);
        return;
      }
      
      var isValid = false;
      
      if (ruleName === 'minLength' || ruleName === 'maxLength') {
        isValid = ruleFunction(value, ruleValue);
      } else {
        isValid = ruleFunction(value);
      }
      
      if (!isValid) {
        var message = self.messages[ruleName] || 'Valeur invalide';
        // Remplacer les placeholders dans le message
        if (ruleName === 'minLength') {
          message = message.replace('{min}', ruleValue);
        } else if (ruleName === 'maxLength') {
          message = message.replace('{max}', ruleValue);
        }
        
        errors.push({
          field: fieldName,
          rule: ruleName,
          message: message,
          value: ruleValue
        });
      }
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  };
  
  // Valider un objet complet
  self.validateObject = function(object, validationSchema) {
    var allErrors = [];
    var isValid = true;
    
    if (!validationSchema || !object) {
      return { valid: false, errors: [{ message: 'Données ou schéma de validation manquant' }] };
    }
    
    // Valider chaque champ défini dans le schéma
    Object.keys(validationSchema).forEach(function(fieldName) {
      var fieldRules = validationSchema[fieldName];
      var fieldValue = object[fieldName];
      
      var fieldValidation = self.validateField(fieldName, fieldValue, fieldRules);
      
      if (!fieldValidation.valid) {
        isValid = false;
        allErrors = allErrors.concat(fieldValidation.errors);
      }
    });
    
    return {
      valid: isValid,
      errors: allErrors,
      fieldErrors: self.groupErrorsByField(allErrors)
    };
  };
  
  // Grouper les erreurs par champ
  self.groupErrorsByField = function(errors) {
    var fieldErrors = {};
    
    errors.forEach(function(error) {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error);
    });
    
    return fieldErrors;
  };
  
  // Schémas de validation prédéfinis
  self.schemas = {
    product: {
      nom: { required: true, minLength: 2, maxLength: 100 },
      unitprice: { required: true, numeric: true, positive: true },
      unitsinstock: { required: true, numeric: true, positive: true },
      quantityperunit: { maxLength: 50 }
    },
    
    commerce: {
      nom: { required: true, minLength: 2, maxLength: 100 },
      adresse1: { required: true, minLength: 5, maxLength: 200 },
      ville: { required: true, minLength: 2, maxLength: 100 },
      code_postal: { required: true, minLength: 4, maxLength: 10 },
      latitude: { required: true, coordinates: true },
      longitude: { required: true, coordinates: true }
    },
    
    user: {
      email: { required: true, email: true },
      password: { required: true, password: true },
      name: { required: true, minLength: 2, maxLength: 100 }
    },
    
    search: {
      lat_query: { required: true, coordinates: true },
      lng_query: { required: true, coordinates: true },
      radius: { numeric: true, positive: true }
    }
  };
  
  // Méthodes de validation rapide pour les schémas prédéfinis
  self.validateProduct = function(product) {
    return self.validateObject(product, self.schemas.product);
  };
  
  self.validateCommerce = function(commerce) {
    return self.validateObject(commerce, self.schemas.commerce);
  };
  
  self.validateUser = function(user) {
    return self.validateObject(user, self.schemas.user);
  };
  
  self.validateSearch = function(searchParams) {
    return self.validateObject(searchParams, self.schemas.search);
  };
  
  // Intégration avec le service de gestion d'erreurs
  self.handleValidationErrors = function(validationResult, context) {
    if (!validationResult.valid) {
      var errorInfo = ErrorHandlerService.handleError(
        {
          data: {
            success: false,
            error: {
              message: 'Erreurs de validation',
              details: validationResult.errors
            }
          },
          status: 422
        },
        context || 'validation'
      );
      
      return errorInfo;
    }
    
    return null;
  };
  
  // Formatter les erreurs pour l'affichage
  self.formatErrorsForDisplay = function(fieldErrors) {
    var displayErrors = {};
    
    Object.keys(fieldErrors).forEach(function(fieldName) {
      displayErrors[fieldName] = fieldErrors[fieldName].map(function(error) {
        return error.message;
      }).join(', ');
    });
    
    return displayErrors;
  };
  
}]);
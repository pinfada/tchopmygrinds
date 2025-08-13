// Service de notifications pour l'application
angular.module('marketApp').service('NotificationService', ['$timeout', '$rootScope', function($timeout, $rootScope) {
  
  var self = this;
  
  // État des notifications
  self.notifications = [];
  self.maxNotifications = 5;
  self.defaultTimeout = 5000; // 5 secondes
  
  // Types de notifications
  self.types = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  };
  
  // Icônes par type
  self.icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  // Classes CSS par type
  self.classes = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  };
  
  // Créer une notification
  self.create = function(message, type, options) {
    type = type || self.types.INFO;
    options = options || {};
    
    var notification = {
      id: Date.now() + Math.random(),
      message: message,
      type: type,
      icon: self.icons[type],
      class: self.classes[type],
      persistent: options.persistent || false,
      timeout: options.timeout || self.defaultTimeout,
      actions: options.actions || [],
      data: options.data || {},
      createdAt: new Date(),
      visible: true
    };
    
    // Ajouter la notification
    self.notifications.unshift(notification);
    
    // Limiter le nombre de notifications
    if (self.notifications.length > self.maxNotifications) {
      self.notifications = self.notifications.slice(0, self.maxNotifications);
    }
    
    // Auto-dismiss si pas persistante
    if (!notification.persistent && notification.timeout > 0) {
      $timeout(function() {
        self.dismiss(notification.id);
      }, notification.timeout);
    }
    
    // Émettre un événement
    $rootScope.$emit('notification:created', notification);
    
    return notification.id;
  };
  
  // Méthodes de convenance
  self.success = function(message, options) {
    return self.create(message, self.types.SUCCESS, options);
  };
  
  self.error = function(message, options) {
    options = options || {};
    options.persistent = options.persistent !== false; // Erreurs persistantes par défaut
    return self.create(message, self.types.ERROR, options);
  };
  
  self.warning = function(message, options) {
    return self.create(message, self.types.WARNING, options);
  };
  
  self.info = function(message, options) {
    return self.create(message, self.types.INFO, options);
  };
  
  // Notifications avec actions
  self.confirm = function(message, onConfirm, onCancel) {
    return self.create(message, self.types.WARNING, {
      persistent: true,
      actions: [
        {
          label: 'Confirmer',
          class: 'btn-primary',
          action: function() {
            if (onConfirm) onConfirm();
          }
        },
        {
          label: 'Annuler',
          class: 'btn-secondary',
          action: function() {
            if (onCancel) onCancel();
          }
        }
      ]
    });
  };
  
  // Notification de progress
  self.progress = function(message, progress) {
    var existingProgress = self.findByData('type', 'progress');
    
    if (existingProgress) {
      existingProgress.message = message;
      existingProgress.data.progress = progress;
      return existingProgress.id;
    } else {
      return self.create(message, self.types.INFO, {
        persistent: true,
        data: { type: 'progress', progress: progress }
      });
    }
  };
  
  // Supprimer une notification
  self.dismiss = function(id) {
    var index = self.notifications.findIndex(function(n) { return n.id === id; });
    
    if (index !== -1) {
      var notification = self.notifications[index];
      notification.visible = false;
      
      // Animation de sortie puis suppression
      $timeout(function() {
        self.notifications.splice(index, 1);
        $rootScope.$emit('notification:dismissed', notification);
      }, 300);
      
      return true;
    }
    
    return false;
  };
  
  // Supprimer toutes les notifications
  self.dismissAll = function() {
    self.notifications.forEach(function(notification) {
      notification.visible = false;
    });
    
    $timeout(function() {
      self.notifications = [];
      $rootScope.$emit('notification:dismissedAll');
    }, 300);
  };
  
  // Trouver une notification
  self.findById = function(id) {
    return self.notifications.find(function(n) { return n.id === id; });
  };
  
  self.findByData = function(key, value) {
    return self.notifications.find(function(n) { 
      return n.data && n.data[key] === value; 
    });
  };
  
  // Notifications spécialisées pour l'application
  self.apiSuccess = function(message, data) {
    return self.success(message || 'Opération réussie', {
      data: { type: 'api_success', ...data }
    });
  };
  
  self.apiError = function(error, context) {
    var message = 'Une erreur est survenue';
    
    if (error && error.message) {
      message = error.message;
    } else if (error && typeof error === 'string') {
      message = error;
    }
    
    return self.error(message, {
      data: { type: 'api_error', context: context, error: error }
    });
  };
  
  self.validationError = function(errors) {
    var message = 'Erreurs de validation';
    
    if (errors && errors.length > 0) {
      if (errors.length === 1) {
        message = errors[0].message;
      } else {
        message = errors.length + ' erreurs de validation';
      }
    }
    
    return self.error(message, {
      data: { type: 'validation_error', errors: errors }
    });
  };
  
  self.geolocationError = function(error) {
    var message = 'Erreur de géolocalisation';
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        message = 'Géolocalisation refusée par l\'utilisateur';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Position non disponible';
        break;
      case error.TIMEOUT:
        message = 'Délai de géolocalisation dépassé';
        break;
      default:
        message = 'Erreur de géolocalisation inconnue';
    }
    
    return self.error(message, {
      data: { type: 'geolocation_error', error: error }
    });
  };
  
  self.connectionError = function() {
    return self.error('Problème de connexion réseau', {
      persistent: true,
      actions: [{
        label: 'Réessayer',
        class: 'btn-primary',
        action: function() {
          window.location.reload();
        }
      }],
      data: { type: 'connection_error' }
    });
  };
  
  // Intégration avec les services existants
  self.handleApiResponse = function(response, successMessage, errorContext) {
    if (response && response.data) {
      if (response.data.success) {
        if (successMessage) {
          self.apiSuccess(successMessage, response.data.meta);
        }
        return true;
      } else if (response.data.error) {
        self.apiError(response.data.error, errorContext);
        return false;
      }
    }
    
    // Fallback sur les codes de statut HTTP
    if (response.status >= 200 && response.status < 300) {
      if (successMessage) {
        self.apiSuccess(successMessage);
      }
      return true;
    } else {
      self.apiError(response.statusText || 'Erreur HTTP ' + response.status, errorContext);
      return false;
    }
  };
  
}]);
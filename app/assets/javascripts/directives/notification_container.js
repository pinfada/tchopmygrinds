// Directive pour afficher le conteneur de notifications
angular.module('marketApp').directive('notificationContainer', ['NotificationService', function(NotificationService) {
  return {
    restrict: 'E',
    scope: {
      position: '@' // top-right, top-left, bottom-right, bottom-left
    },
    template: `
      <div class="notification-container" ng-class="positionClass">
        <div ng-repeat="notification in notifications track by notification.id" 
             class="notification-item"
             ng-class="[notification.class, {'notification-hiding': !notification.visible}]"
             ng-show="notification.visible">
          
          <div class="notification-content">
            <!-- Icône -->
            <div class="notification-icon">
              <i class="fa" ng-class="notification.icon"></i>
            </div>
            
            <!-- Message principal -->
            <div class="notification-body">
              <div class="notification-message">{{notification.message}}</div>
              
              <!-- Barre de progression si applicable -->
              <div ng-if="notification.data.progress !== undefined" class="notification-progress">
                <div class="progress-bar" ng-style="{'width': notification.data.progress + '%'}"></div>
              </div>
              
              <!-- Actions -->
              <div ng-if="notification.actions.length > 0" class="notification-actions">
                <button ng-repeat="action in notification.actions" 
                        class="btn btn-sm"
                        ng-class="action.class"
                        ng-click="executeAction(notification.id, action)">
                  {{action.label}}
                </button>
              </div>
            </div>
            
            <!-- Bouton de fermeture -->
            <div class="notification-close">
              <button class="btn-close" ng-click="dismiss(notification.id)" aria-label="Fermer">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>
          
          <!-- Timer visuel pour les notifications temporaires -->
          <div ng-if="!notification.persistent && notification.timeout > 0" 
               class="notification-timer"
               ng-class="'timer-' + notification.type"></div>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Position du conteneur
      scope.position = scope.position || 'top-right';
      scope.positionClass = 'position-' + scope.position;
      
      // Référence aux notifications
      scope.notifications = NotificationService.notifications;
      
      // Actions
      scope.dismiss = function(id) {
        NotificationService.dismiss(id);
      };
      
      scope.executeAction = function(notificationId, action) {
        if (action.action && typeof action.action === 'function') {
          action.action();
        }
        
        // Fermer la notification après action (sauf si spécifiée autrement)
        if (action.dismissAfter !== false) {
          NotificationService.dismiss(notificationId);
        }
      };
      
      // Écouter les événements de notifications
      scope.$on('notification:created', function(event, notification) {
        // Animation d'entrée si nécessaire
        element.find('.notification-item:first').addClass('notification-entering');
      });
    }
  };
}]);

// Directive pour les toasts (notifications légères)
angular.module('marketApp').directive('toastNotification', ['NotificationService', '$timeout', function(NotificationService, $timeout) {
  return {
    restrict: 'E',
    scope: {
      message: '@',
      type: '@',
      timeout: '@',
      autoShow: '='
    },
    template: `
      <div class="toast-notification" ng-class="['toast-' + type, {'toast-visible': visible}]">
        <div class="toast-content">
          <i class="fa" ng-class="getIcon(type)"></i>
          <span class="toast-message">{{message}}</span>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      scope.visible = false;
      scope.type = scope.type || 'info';
      scope.timeout = parseInt(scope.timeout) || 3000;
      
      scope.getIcon = function(type) {
        var icons = {
          success: 'fa-check-circle',
          error: 'fa-exclamation-circle',
          warning: 'fa-exclamation-triangle',
          info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
      };
      
      scope.show = function() {
        scope.visible = true;
        
        if (scope.timeout > 0) {
          $timeout(function() {
            scope.hide();
          }, scope.timeout);
        }
      };
      
      scope.hide = function() {
        scope.visible = false;
      };
      
      // Auto-show si configuré
      if (scope.autoShow !== false && scope.message) {
        $timeout(function() {
          scope.show();
        }, 100);
      }
      
      // Écouter les changements de message
      scope.$watch('message', function(newValue) {
        if (newValue && scope.autoShow !== false) {
          scope.show();
        }
      });
    }
  };
}]);
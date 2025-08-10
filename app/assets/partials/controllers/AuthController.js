(function() {
    'use strict';
    
    angular.module('marketApp')
        .controller('AuthController', ['$scope', 'AuthService', '$window', '$location',
            function($scope, AuthService, $window, $location) {
                
                // Initialisation des données utilisateur
                $scope.authUser = {
                    loggedIn: false,
                    name: null,
                    email: null,
                    id: null,
                    seller_role: false,
                    buyerRole: false,
                    statut_type: null,
                    initials: null
                };
                
                // Fonction pour calculer les initiales
                function getInitials(name) {
                    if (!name) return null;
                    return name.split(' ')
                        .map(function(word) { return word.charAt(0); })
                        .join('')
                        .toUpperCase();
                }
                
                // Charger les données utilisateur au démarrage
                function loadUserData() {
                    AuthService.getUserDisplay().then(function(userData) {
                        $scope.authUser = userData;
                        $scope.authUser.initials = getInitials(userData.name);
                        
                        // Utiliser les données serveur si disponibles
                        if (typeof window.currentUserData !== 'undefined') {
                            angular.extend($scope.authUser, window.currentUserData);
                            $scope.authUser.loggedIn = window.isAuthenticated || false;
                            $scope.authUser.initials = getInitials($scope.authUser.name);
                        }
                    });
                }
                
                // Méthodes d'authentification réutilisables
                $scope.requireAuth = function(callback, errorMessage) {
                    AuthService.requireAuth(
                        callback,
                        function() {
                            if (errorMessage) {
                                alert(errorMessage);
                            }
                            $location.path('/users/sign_in');
                        }
                    );
                };
                
                $scope.isSeller = function() {
                    return $scope.authUser.seller_role === true;
                };
                
                $scope.isBuyer = function() {
                    return $scope.authUser.buyerRole === true;
                };
                
                $scope.isAuthenticated = function() {
                    return $scope.authUser.loggedIn === true;
                };
                
                // Gestion de la déconnexion
                $scope.handleLogout = function() {
                    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                        AuthService.logout().then(function() {
                            $scope.authUser = {
                                loggedIn: false,
                                name: null,
                                email: null,
                                id: null,
                                seller_role: false,
                                buyerRole: false,
                                statut_type: null,
                                initials: null
                            };
                            $window.location.href = '/';
                        });
                    }
                };
                
                // Rafraîchir les données utilisateur (utile après connexion/inscription)
                $scope.refreshAuth = function() {
                    AuthService.refreshCache().then(function() {
                        loadUserData();
                    });
                };
                
                // Écouter les changements d'authentification
                $scope.$on('auth:login-success', function() {
                    $scope.refreshAuth();
                });
                
                $scope.$on('auth:logout-success', function() {
                    $scope.authUser = {
                        loggedIn: false,
                        name: null,
                        email: null,
                        id: null,
                        seller_role: false,
                        buyerRole: false,
                        statut_type: null,
                        initials: null
                    };
                });
                
                // Charger les données au démarrage
                loadUserData();
            }
        ]);
})();
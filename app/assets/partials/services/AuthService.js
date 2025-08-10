(function() {
    'use strict';
    
    angular.module('marketApp')
        .service('AuthService', ['Auth', '$q', function(Auth, $q) {
            
            var currentUserCache = null;
            var isAuthenticatedCache = null;
            
            return {
                // Méthode centralisée pour vérifier l'authentification
                isAuthenticated: function() {
                    if (isAuthenticatedCache === null) {
                        isAuthenticatedCache = Auth.isAuthenticated();
                    }
                    return isAuthenticatedCache;
                },
                
                // Méthode centralisée pour obtenir l'utilisateur actuel
                getCurrentUser: function() {
                    var deferred = $q.defer();
                    
                    if (currentUserCache) {
                        deferred.resolve(currentUserCache);
                        return deferred.promise;
                    }
                    
                    if (this.isAuthenticated()) {
                        Auth.currentUser().then(function(user) {
                            currentUserCache = user;
                            deferred.resolve(user);
                        }, function(error) {
                            deferred.reject(error);
                        });
                    } else {
                        deferred.resolve(null);
                    }
                    
                    return deferred.promise;
                },
                
                // Vérifier si l'utilisateur est vendeur
                isSeller: function() {
                    var deferred = $q.defer();
                    
                    this.getCurrentUser().then(function(user) {
                        deferred.resolve(user && user.seller_role === true);
                    }, function() {
                        deferred.resolve(false);
                    });
                    
                    return deferred.promise;
                },
                
                // Vérifier si l'utilisateur est acheteur
                isBuyer: function() {
                    var deferred = $q.defer();
                    
                    this.getCurrentUser().then(function(user) {
                        deferred.resolve(user && user.buyerRole === true);
                    }, function() {
                        deferred.resolve(false);
                    });
                    
                    return deferred.promise;
                },
                
                // Vérifier le type de statut de l'utilisateur
                getUserType: function() {
                    var deferred = $q.defer();
                    
                    this.getCurrentUser().then(function(user) {
                        if (!user) {
                            deferred.resolve('guest');
                        } else if (user.seller_role === true) {
                            deferred.resolve(user.statut_type || 'sedentary');
                        } else if (user.buyerRole === true) {
                            deferred.resolve('buyer');
                        } else {
                            deferred.resolve('unknown');
                        }
                    }, function() {
                        deferred.resolve('guest');
                    });
                    
                    return deferred.promise;
                },
                
                // Exécuter une action si l'utilisateur est authentifié
                requireAuth: function(callback, errorCallback) {
                    var self = this;
                    
                    if (this.isAuthenticated()) {
                        this.getCurrentUser().then(function(user) {
                            callback(user);
                        }, errorCallback);
                    } else {
                        if (errorCallback) {
                            errorCallback('User not authenticated');
                        }
                    }
                },
                
                // Déconnexion avec nettoyage du cache
                logout: function() {
                    currentUserCache = null;
                    isAuthenticatedCache = null;
                    return Auth.logout();
                },
                
                // Rafraîchir le cache utilisateur
                refreshCache: function() {
                    currentUserCache = null;
                    isAuthenticatedCache = null;
                    return this.getCurrentUser();
                },
                
                // Obtenir les informations utilisateur pour l'interface
                getUserDisplay: function() {
                    var deferred = $q.defer();
                    
                    this.getCurrentUser().then(function(user) {
                        if (user) {
                            deferred.resolve({
                                loggedIn: true,
                                name: user.name,
                                email: user.email,
                                id: user.id,
                                seller_role: user.seller_role,
                                buyerRole: user.buyerRole,
                                statut_type: user.statut_type
                            });
                        } else {
                            deferred.resolve({
                                loggedIn: false,
                                name: null,
                                email: null,
                                id: null,
                                seller_role: false,
                                buyerRole: false,
                                statut_type: null
                            });
                        }
                    }, function() {
                        deferred.resolve({
                            loggedIn: false,
                            name: null,
                            email: null,
                            id: null,
                            seller_role: false,
                            buyerRole: false,
                            statut_type: null
                        });
                    });
                    
                    return deferred.promise;
                }
            };
        }]);
})();
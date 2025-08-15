// Helpers d'authentification globaux pour éviter les répétitions
(function(window) {
    'use strict';
    
    // Namespace global pour les helpers d'auth
    window.TchopAuthHelpers = {
        
        // Vérifier l'état d'authentification côté client
        isAuthenticated: function() {
            return window.isAuthenticated === true || 
                   (window.currentUserData && window.currentUserData.id);
        },
        
        // Obtenir les données utilisateur actuelles
        getCurrentUser: function() {
            return window.currentUserData || null;
        },
        
        // Vérifier si l'utilisateur est vendeur
        isSeller: function() {
            var user = this.getCurrentUser();
            return user && user.seller_role === true;
        },
        
        // Vérifier si l'utilisateur est acheteur  
        isBuyer: function() {
            var user = this.getCurrentUser();
            return user && user.buyer_role === true;
        },
        
        // Obtenir le type d'utilisateur
        getUserType: function() {
            if (!this.isAuthenticated()) return 'guest';
            
            var user = this.getCurrentUser();
            if (user.seller_role) {
                return user.statut_type || 'sedentary';
            } else if (user.buyer_role) {
                return 'buyer';
            }
            return 'user';
        },
        
        // Obtenir les initiales de l'utilisateur
        getUserInitials: function() {
            var user = this.getCurrentUser();
            if (!user || !user.name) return null;
            
            return user.name.split(' ')
                .map(function(word) { return word.charAt(0); })
                .join('')
                .toUpperCase();
        },
        
        // Afficher/masquer les éléments selon l'état d'auth
        toggleAuthElements: function() {
            var isAuth = this.isAuthenticated();
            var userType = this.getUserType();
            
            // Éléments pour utilisateurs connectés
            var authElements = document.querySelectorAll('[data-auth="authenticated"]');
            authElements.forEach(function(el) {
                el.style.display = isAuth ? 'block' : 'none';
            });
            
            // Éléments pour invités
            var guestElements = document.querySelectorAll('[data-auth="guest"]');
            guestElements.forEach(function(el) {
                el.style.display = isAuth ? 'none' : 'block';
            });
            
            // Éléments pour vendeurs
            var sellerElements = document.querySelectorAll('[data-auth="seller"]');
            sellerElements.forEach(function(el) {
                el.style.display = this.isSeller() ? 'block' : 'none';
            }.bind(this));
            
            // Éléments pour acheteurs
            var buyerElements = document.querySelectorAll('[data-auth="buyer"]');
            buyerElements.forEach(function(el) {
                el.style.display = this.isBuyer() ? 'block' : 'none';
            }.bind(this));
            
            // Ajouter classes CSS au body pour styling conditionnel
            document.body.classList.toggle('user-authenticated', isAuth);
            document.body.classList.toggle('user-guest', !isAuth);
            document.body.classList.toggle('user-seller', this.isSeller());
            document.body.classList.toggle('user-buyer', this.isBuyer());
        },
        
        // Exécuter une fonction uniquement si l'utilisateur est connecté
        requireAuth: function(callback, errorCallback) {
            if (this.isAuthenticated()) {
                callback(this.getCurrentUser());
            } else if (errorCallback) {
                errorCallback();
            } else {
                // Redirection par défaut
                window.location.href = '/users/sign_in';
            }
        },
        
        // Formater le nom d'affichage de l'utilisateur
        getDisplayName: function() {
            var user = this.getCurrentUser();
            if (!user) return 'Invité';
            
            return user.name || user.email || 'Utilisateur';
        },
        
        // Obtenir le badge de rôle HTML
        getRoleBadgeHtml: function() {
            if (!this.isAuthenticated()) return '';
            
            var user = this.getCurrentUser();
            if (user.seller_role) {
                var type = (user.statut_type || 'Vendeur').charAt(0).toUpperCase() + 
                          (user.statut_type || 'Vendeur').slice(1);
                return '<span class="user-role-badge seller"><i class="fas fa-store"></i> ' + type + '</span>';
            } else if (user.buyer_role) {
                return '<span class="user-role-badge buyer"><i class="fas fa-shopping-basket"></i> Acheteur</span>';
            }
            return '';
        },
        
        // Initialiser les helpers au chargement de la page
        init: function() {
            var self = this;
            
            // Mettre à jour l'interface au chargement
            document.addEventListener('DOMContentLoaded', function() {
                self.toggleAuthElements();
            });
            
            // Écouter les changements d'authentification
            if (window.addEventListener) {
                window.addEventListener('auth:login', function() {
                    setTimeout(function() { self.toggleAuthElements(); }, 100);
                });
                
                window.addEventListener('auth:logout', function() {
                    setTimeout(function() { self.toggleAuthElements(); }, 100);
                });
            }
        }
    };
    
    // Auto-initialisation
    window.TchopAuthHelpers.init();
    
})(window);

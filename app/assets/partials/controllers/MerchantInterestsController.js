angular.module('marketApp').controller('MerchantInterestsController', [
    '$scope', '$http', '$uibModal', 'Auth', 
    function($scope, $http, $uibModal, Auth) {
        
        // Variables d'état
        $scope.merchantInterests = [];
        $scope.loadingInterests = false;
        $scope.interestPeriod = '30 derniers jours';
        $scope.userCommerces = [];
        
        // Initialisation
        $scope.init = function() {
            $scope.checkUserRole();
            $scope.loadUserCommerces();
            $scope.loadMerchantInterests();
        };
        
        // Vérifier que l'utilisateur est bien un marchand
        $scope.checkUserRole = function() {
            Auth.currentUser().then(function(user) {
                if (!user.seller_role) {
                    alert('Cette page est réservée aux marchands.');
                    window.location.href = '/';
                }
                $scope.currentUser = user;
            });
        };
        
        // Charger les commerces de l'utilisateur
        $scope.loadUserCommerces = function() {
            Auth.currentUser().then(function(user) {
                $http.get('/users/' + user.id + '/commerces').then(function(response) {
                    $scope.userCommerces = response.data;
                }).catch(function(error) {
                    // Error loading user commerces
                });
            });
        };
        
        // Charger les demandes de produits pour les marchands
        $scope.loadMerchantInterests = function() {
            $scope.loadingInterests = true;
            
            $http.get('/product_interests/for_merchants').then(function(response) {
                $scope.merchantInterests = response.data.interests || [];
                $scope.loadingInterests = false;
                
                if (response.data.message) {
                    // API returned a message: response.data.message
                }
            }).catch(function(error) {
                $scope.loadingInterests = false;
                // Error loading merchant interests
                
                if (error.status === 403) {
                    alert('Accès refusé. Cette fonctionnalité est réservée aux marchands.');
                } else {
                    alert('Erreur lors du chargement des demandes.');
                }
            });
        };
        
        // Définir la période de recherche
        $scope.setInterestPeriod = function(period) {
            $scope.interestPeriod = period;
            // TODO: Implémenter le filtrage par période
            $scope.loadMerchantInterests();
        };
        
        // Répondre à une demande en ajoutant un produit
        $scope.respondToInterest = function(interest) {
            $scope.selectedInterest = interest;
            
            var modalInstance = $uibModal.open({
                templateUrl: 'addProductModal.html',
                controller: 'AddProductModalController',
                size: 'md',
                resolve: {
                    interest: function() {
                        return interest;
                    },
                    userCommerces: function() {
                        return $scope.userCommerces;
                    }
                }
            });
            
            modalInstance.result.then(function(productAdded) {
                if (productAdded) {
                    $scope.showSuccessMessage('Produit ajouté avec succès !');
                    // Optionnel: retirer cette demande de la liste
                    var index = $scope.merchantInterests.indexOf(interest);
                    if (index > -1) {
                        $scope.merchantInterests.splice(index, 1);
                    }
                }
            });
        };
        
        // Contacter un client (fonctionnalité future)
        $scope.contactClient = function(interest) {
            alert('Fonctionnalité de contact direct en cours de développement.\n\n' +
                  'En attendant, ajoutez le produit demandé et le client sera notifié automatiquement.');
        };
        
        // Afficher un message de succès
        $scope.showSuccessMessage = function(message) {
            var alertDiv = angular.element(
                '<div class="alert alert-success success-message">' + 
                '<i class="fa fa-check-circle"></i> ' + message + 
                '</div>'
            );
            angular.element('body').append(alertDiv);
            
            setTimeout(function() {
                alertDiv.fadeOut(500, function() {
                    alertDiv.remove();
                });
            }, 3000);
        };
        
        // Lancer l'initialisation
        $scope.init();
    }
]);

// Contrôleur pour le modal d'ajout de produit
angular.module('marketApp').controller('AddProductModalController', [
    '$scope', '$uibModalInstance', '$http', 'interest', 'userCommerces',
    function($scope, $uibModalInstance, $http, interest, userCommerces) {
        
        $scope.selectedInterest = interest;
        $scope.userCommerces = userCommerces;
        $scope.savingProduct = false;
        $scope.notifyClient = true;
        
        // Données du nouveau produit pré-remplies
        $scope.newProduct = {
            nom: interest.product_name,
            description: '',
            unitprice: null,
            unitsinstock: null,
            commerce_id: userCommerces.length === 1 ? userCommerces[0].id : null
        };
        
        // Sauvegarder le nouveau produit
        $scope.saveNewProduct = function() {
            if (!$scope.newProduct.commerce_id) {
                alert('Veuillez sélectionner un commerce.');
                return;
            }
            
            $scope.savingProduct = true;
            
            var productData = {
                product: {
                    nom: $scope.newProduct.nom,
                    description: $scope.newProduct.description,
                    unitprice: $scope.newProduct.unitprice,
                    unitsinstock: $scope.newProduct.unitsinstock,
                    unitsonorder: 0
                }
            };
            
            // Créer le produit
            $http.post('/commerces/' + $scope.newProduct.commerce_id + '/products', productData)
                .then(function(response) {
                    $scope.savingProduct = false;
                    
                    // Si demandé, notifier le client (fonctionnalité future)
                    if ($scope.notifyClient) {
                        $scope.notifyClientOfAvailability();
                    }
                    
                    $uibModalInstance.close(true);
                })
                .catch(function(error) {
                    $scope.savingProduct = false;
                    // Error creating product - display user-friendly error message
                    alert('Erreur lors de la création du produit.');
                });
        };
        
        // Notifier le client que le produit est disponible
        $scope.notifyClientOfAvailability = function() {
            // TODO: Implémenter la notification au client
            // Cela pourrait marquer l'intérêt comme "fulfilled" et envoyer un email
            // Client notification would be sent for this interest
        };
    }
]);
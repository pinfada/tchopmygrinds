marketApp.controller("modalOrder", [
    '$q', 
    '$scope',
    '$uibModalInstance', 
    '$log', 
    '$route',
    'boutique', 
    'user',
    'GetCommerceProducts',
    'GetUserOrders',
    'GetOrderDetails',
    function ($q, $scope, $uibModalInstance, $log, $route, boutique, user, GetCommerceProducts, GetUserOrders, GetOrderDetails){

    var deferred = $q.defer();


    // Récupération de la liste des produits pour un commerce
    GetCommerceProducts.get({commerceId: boutique.id}).then(function (products) {
        //console.log("produits :", products)
        $scope.nbproduit = products.length
        $scope.produits = products
        
    }, function (error) {
        // do something about the error
        console.log("Error Log",error.statusText);
        deferred.reject(error);
    });

    $scope.$on('ngCart:checkout_succeeded', function(event, cart) {
        console.log("cart : ", cart)
        var cart = {
            OrderDate: new Date().toISOString().slice(0,10),
            requiredate: new Date().toISOString().slice(0,10),
            shippedate: '',
            status: '0',
            userId: user.id
        }
        $log.log('Submiting store info.'); // kinda console logs this statement
        $log.log(cart);
        //new GetUserOrders(
        //    cart 
        //).create();
    });

    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.submit = function (dataselect) {
        $uibModalInstance.close(false); 
    };

}]);
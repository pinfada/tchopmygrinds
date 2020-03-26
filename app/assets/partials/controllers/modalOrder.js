marketApp.controller("modalOrder", [
    '$q', 
    '$scope',
    '$uibModalInstance', 
    '$log', 
    '$route',
    'boutique', 
    'GetCommerceProducts',
    function ($q, $scope, $uibModalInstance, $log, $route, boutique, GetCommerceProducts){

    var deferred = $q.defer();


    // On vérifie la présence de produit pour chaque commerce présent en base
    GetCommerceProducts.get({commerceId: boutique.id}).then(function (products) {
        //console.log("produits :", products)
        $scope.nbproduit = products.length
        $scope.produits = products
        
    }, function (error) {
        // do something about the error
        console.log("Error Log",error.statusText);
        deferred.reject(error);
    });

    //$scope.produits = produits
    //$scope.nbproduit = produits.length

    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.submit = function (dataselect) {
        $uibModalInstance.close(false); 
    };

}]);
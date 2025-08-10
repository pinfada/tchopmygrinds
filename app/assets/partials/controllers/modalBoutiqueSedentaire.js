marketApp.controller("modalBoutiqueSedentaire", [
    '$q', 
    '$scope',
    '$uibModalInstance', 
    '$log', 
    '$route', 
    'usercoord', 
    'user', 
    'GetUserCommerces',
    function ($q, $scope, $uibModalInstance, $log, $route, usercoord, user, GetUserCommerces){

    var deferred = $q.defer();

    //console.log("modalBoutiqueSedentaire --> usercoord : ", usercoord)

    $scope.commerceaffiche = [5, 15, 30, 50]

    $scope.affichage = function(item) {
        // MapQuest supprimé: pas de suggestions automatiques
        $scope.boutiques = [];
    };

    $scope.data = {}

    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.submit = function (dataselect) {
        
        //var total = $scope.data.boutiqueSelect.length;
        var result = dataselect.boutiqueSelect
        var total = result.length
        for(var i=0; i<total; i++) {
            if(result[i] !== "") {
                var store = angular.fromJson(result[i])
                //console.log("store : ", store)
                var commerce = {
                    name: store.fields.name,
                    adress1: store.fields.address,
                    adress2: '',
                    details: '',
                    postal: store.fields.postal_code,
                    country: store.fields.country,
                    latitude: store.fields.lat,
                    longitude: store.fields.lng,
                    city: store.fields.city,
                    userId: user.id
                }
                $log.log('Submiting store info.'); // kinda console logs this statement
                $log.log(commerce);
                new GetUserCommerces(
                    commerce 
                ).create();
            }
            $uibModalInstance.close('cancel');
            $route.reload();
        }
        
    };

}]);
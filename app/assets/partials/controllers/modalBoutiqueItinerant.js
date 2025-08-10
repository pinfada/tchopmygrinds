marketApp.controller("modalBoutiqueItinerant", [
    '$q', 
    '$scope',
    '$uibModalInstance', 
    '$log', 
    '$route', 
    'usercoord', 
    'user', 
    'GetUserCommerces',
    'myBoutiques',
    function ($q, $scope, $uibModalInstance, $log, $route, usercoord, user, GetUserCommerces, myBoutiques){

    var deferred = $q.defer();

    // Debug: modalBoutiqueItinerant user coordinates

    $scope.CommerceName= "Enter commerce name here..."

    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.submit = function (CommerceName) {
        // Commerce name entered by user
        if(CommerceName !== "") {
            var commerce = {
                name: CommerceName,
                adress1: '',
                adress2: '',
                details: '',
                postal: '',
                country: '',
                latitude: usercoord.lat,
                longitude: usercoord.lng,
                city: '',
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
        
    };

}]);
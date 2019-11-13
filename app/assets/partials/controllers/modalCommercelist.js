marketApp.controller("modalCommercelist", ['$scope', '$uibModalInstance', '$log', 'Auth', '$route', 'commercenear', 'ngCart',  function ($scope, $uibModalInstance, $log, Auth, $route, commercenear, ngCart){

    $scope.content = commercenear;
    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
}]);
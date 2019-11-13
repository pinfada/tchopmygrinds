marketApp.controller("modalRegistration", ['$scope', '$uibModalInstance', '$log', 'Auth', '$route',  function ($scope, $uibModalInstance, $log, Auth, $route){

    $scope.credentials = { email: '', password: '' };

    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.signIn = function () {
        $log.log('Submiting user info.'); // kinda console logs this statement
        $log.log($scope.credentials);
        Auth.login($scope.credentials).then(function(user) {
            $uibModalInstance.close('cancel');
            $route.reload();
        }, function(error) {
            console.info('Error in authenticating user!');
            alert('Error in signing in user!');
        });
    };
}]);
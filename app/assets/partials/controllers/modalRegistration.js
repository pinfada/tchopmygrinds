marketApp.controller("modalRegistration", [
    '$scope', 
    '$uibModal', 
    '$uibModalInstance', 
    '$log', 
    'Auth', 
    '$route', 
    'coordinates', 
    'boutiques', 
    function ($scope, $uibModal, $uibModalInstance, $log, Auth, $route, coordinates, boutiques){

    $scope.credentials = {email: '', password: ''};
    $scope.data = {name: '', email: '', password: 'motdepasse', password_confirmation: 'motdepasse', userSelect: '', buyer_role: '', seller_role: ''};
    $scope.seller_role = 'false'; 
    $scope.buyer_role = 'false';

    $scope.usertypes = [
      {name:'buyer'},
      {name:'seller'}
    ];

    $scope.usermobilities = [
      {name:'itinerant', address: false},
      {name:'sedentary', address: true}
    ];

//    $scope.cancel = function () {
//        $uibModalInstance.close(false); 
//    };
//    
//    $scope.submit = function () {
//        $log.log('Submiting user info.')
//        $log.log($scope.credentials);
//    };

    $scope.signIn = function () {
        $log.log('Sign in user info.'); // kinda console logs this statement
        $log.log($scope.credentials);
        Auth.login($scope.credentials).then(function(user) {
            $uibModalInstance.close('cancel');
            $route.reload();
        }, function(error) {
            console.info('Error in authenticating user!');
            alert('Error in signing in user!');
        });
    };

    $scope.signUp = function (data) {
        $log.log('Register user info.'); // kinda console logs this statement
        if (data.userSelect == "buyer") {
            $scope.data.buyer_role = true
        }
        else {
            $scope.data.seller_role = true
        }
        delete $scope.data.userSelect
        Auth.register($scope.data).then(function(registeredUser) {
            alert(registeredUser.email + " You'll receive confirmation email !");
        //    $route.reload();
        }, function(error) {
            console.info('Error in user registration!');
            alert('Error in user registration!');
        });
    };



    $scope.$on('devise:new-registration', function(event, user) {
    //$scope.$on('devise:login', function(event, user) {
        console.log(user)
        console.log($scope.seller_role)
        if ($scope.data.seller_role == true){

    //          boutiques.getBoutiques([resultcoord.lat, resultcoord.lng]).then(function (boutique) {
                boutiques.getBoutiques([47.4550213, -0.5370654]).then(function (boutique) {
                    $uibModal.open({
                        templateUrl: "<%= asset_path('Templates/myModalMarker.html') %>", // loads the template
                        controller: 'modalMarker',
                        backdrop: true,
                        windowClass: 'modal',
                        resolve: {
                            boutique: function () {
                                return boutique; 
                            }
                        }
                    })
                })

            $scope.isSeller = true;
        }
        if (user.buyer_role == true){
          $scope.isBuyer = true;
        }
    });

}]);
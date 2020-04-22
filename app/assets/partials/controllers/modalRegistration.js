marketApp.controller("modalRegistration", [
    '$scope', 
    '$uibModal', 
    '$uibModalInstance', 
    '$log', 
    'Auth', 
    '$route', 
    '$window',
    'coordinates', 
    'boutiques', 
    'GetUserAddresses',
    function ($scope, $uibModal, $uibModalInstance, $log, Auth, $route, $window, coordinates, boutiques, GetUserAddresses){

    $scope.credentials = {
        email: '', 
        password: ''};

    $scope.data = {
        name: '', 
        email: '', 
        password: 'motdepasse', 
        password_confirmation: 'motdepasse', 
        userSelect: '', 
        myMobility: '',
        buyer_role: '', 
        seller_role: '', 
        statut_type: ''
    };

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
            //$route.reload();
            $window.location.reload()
        }, function(error) {
            //console.info('Error in authenticating user!');
            alert('Error in signing in user!');
        });
    };

    $scope.signUp = function (data) {
        $log.log('Register user info.'); // kinda console logs this statement
        if (data.userSelect.name == "buyer") {
            $scope.data.buyer_role = true
            $scope.data.seller_role = false
        }
        else {
            $scope.data.seller_role = true
            $scope.data.buyer_role = false
            switch (data.myMobility.name) {
                case "itinerant" :
                    $scope.data.statut_type = 0;
                    break;
                case "sedentary" :
                    $scope.data.statut_type = 1;
                    break;
                default:
                    $scope.data.statut_type = 2;
            }

        }
        delete $scope.data.userSelect
        delete $scope.data.myMobility

        Auth.register($scope.data).then(function(registeredUser) {
            alert(registeredUser.email + " You'll receive confirmation email !");
        //    $route.reload();
        }, function(error) {
            //console.info('Error in user registration!');
            alert('Error in user registration!');
        });
    };

    // A la souscription on stocke l'adresse de l'utilisation à partir de ses coordonnées
    $scope.$on('devise:new-registration', function(event, user) {
    //$scope.$on('devise:login', function(event, user) {
        //coordinates.getCoordinates().then(function (position) {
            var address = {
                address1: '',
                address2: 'non fournie',
                country: '',
                city: '',
                zipcode: '',
                state: '',
                latitude: coordinates[0],
                longitude: coordinates[1],
                userId: user.id
            }

            $log.log('Submiting address info.'); // kinda console logs this statement
            $log.log(address);
            new GetUserAddresses(
                address 
            ).create();
            $uibModalInstance.close('cancel');
            $route.reload();
        //})
    });

}]);
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
    '$location', 
    '$routeParams',
    function ($scope, $uibModal, $uibModalInstance, $log, Auth, $route, $window, coordinates, boutiques, GetUserAddresses, $location, $routeParams){

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

    $scope.checkboxModel = {
        value1 : false
    }
    //console.log('checkbox', $scope.checkboxModel)

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

    $scope.resetpassword = function (data) {
        
        if (data.password === data.password_confirmation) {
            var parameters = {
                password: data.password,
                password_confirmation: data.password_confirmation,
                reset_password_token: $routeParams.resetToken
            };

            console.log('modalRegistration : ', parameters);

            Auth.resetPassword(parameters).then(function(data) {
                // Sended email if user found otherwise email not sended...
                $log.log('modalRegistration reset password :', data);
            }, function(error) {
                console.info('Error reset password!', error);
                alert('Error reset password!');
            });

            $scope.$on('devise:reset-password-successfully', function(event) {
                // ...
                alert("Password Changed Successfully");
                $location.path("/sign_in");
            });
        }

    }

    $scope.signIn = function () {
        $log.log('Sign in user info.'); // kinda console logs this statement
        $log.log('modalRegistration signIn :', $scope.credentials);
        Auth.login($scope.credentials).then(function(user) {
            $uibModalInstance.close('cancel');
            //$route.reload();
            $window.location.reload()
        }, function(error) {
            console.info('Error in authenticating user!', error);
            alert('Error in signing in user!');
        });
    };

    $scope.signUp = function (data) {
        $log.log('Register user info.'); // kinda console logs this statement
        if (data.userSelect.name == "buyer") {
            $scope.data.buyer_role = true
            $scope.data.seller_role = false
            $scope.data.statut_type = 2;
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
            $window.location.reload()
        }, function(error) {
            console.info('Error in user registration!', error);
            alert('Error in user registration!');
        });
    };

    // Gestion evenement à la souscription : on stocke l'adresse de l'utilisateur à partir de ses coordonnées
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

            $log.log("new-registration --> address : ", address); // kinda console logs this statement
            //$log.log(address);
            new GetUserAddresses(
                address 
            ).create();
            $uibModalInstance.close('cancel');
            $route.reload();
        //})
    });

}]);

// Define the `marketApp` module
	var modules = [
		'ngRoute', 
		'templates', 
		'ui.bootstrap', 
		'rails', 
		'nemLogging',
		'ui-leaflet',
		'Devise',
		'ngCart',
		'angularTrix',
		'ngGeolocation',
		'angular.filter'
	];
	var marketApp = angular.module('marketApp', modules);

	marketApp.run(['Auth', '$window', function (Auth, $window) {
		//console.log("Auth : ", Auth);
	    Auth.currentUser().then(function(user) {
	      console.log("User sign in : ", user);
	      //console.log(Auth._currentUser);
	    }, function (error) {
            // do something about the error
            //console.log("Error Log",error.statusText);
			$window.alert("Welcome, Please Tchopers have to login first to use the App");
            //console.info("Tchopers have to login first...");
        });
	}]);

	marketApp.config([
		'$routeProvider', 
		'$locationProvider',
		function($routeProvider, $locationProvider) {
		
		// Fonction helper temporaire pour obtenir les URLs de templates
		function getTemplateUrl(templateName) {
			var templates = {
				main: "/assets/Templates/main-6c120c7d674b7e66d3f03b454bccb6fb142ec4d7fbda48ac5b9bb26e64aff9c8.html",
				header: "/assets/Templates/header-3742d18d17237cfa1d6f4145b86392be35c88e1f01a6e1a1c343f080cfa4786e.html",
				fail: "/assets/Templates/fail-bfddade570795ec527e413f56261920bf04541a444b4a66c7c773736e56b9e2c.html",
				cart: "/assets/Templates/cart-76c7ebff0572d88c686da2af13740528b8c188016b0398756a231a0dfec69d15.html",
				checkout: "/assets/Templates/checkout-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.html",
				merchantInterests: "/assets/Templates/merchant_interests-2a6d991b7ca5a21846c9c41e4689efc2beb62d09eb5899c26ff930f53b72937e.html"
			};
			return templates[templateName] || '';
		}
    	// use the HTML5 History API
    	$locationProvider.html5Mode({
  			enabled: true,
  			requireBase: false
			});
//  	  $locationProvider.hashPrefix('');

    	$routeProvider
			.when('/', {
				controller: 'MainController',
				templateUrl: getTemplateUrl('main'),
				resolve: {
					coordinates: function (myCoordinates) {
						return myCoordinates;
					},
					boutiques: function (myBoutiques) {
						return myBoutiques;
					},
					markers: function (myMarkers) {
						return myMarkers;
					}
				}
			})

			.when('/search', {
				controller: 'MainController',
				templateUrl: getTemplateUrl('main'),
				resolve: {
					coordinates: function (myCoordinates) {
						return myCoordinates;
					},
					boutiques: function (myBoutiques) {
						return myBoutiques;
					},
					markers: function (myMarkers) {
						return myMarkers;
					},
					dynamicposition: function (myPosition) {
						return myPosition;
					}
				}
			})
			
			.when('/searchnear', {
				controller: 'HeaderController',
				templateUrl: getTemplateUrl('header'),
				resolve: {
					coordinates: function (myCoordinates) {
						return myCoordinates;
					}
				}
			})	
			
			.when('/fail', {
				templateUrl: getTemplateUrl('fail'),
			})

        	.when('/cart', {
        	    templateUrl: getTemplateUrl('cart')
        	})

        	.when('/checkout', {
        	    templateUrl: getTemplateUrl('checkout')
        	})

        	.when('/merchant/interests', {
        	    controller: 'MerchantInterestsController',
        	    templateUrl: getTemplateUrl('merchantInterests')
        	})

        	.otherwise('/');
		
	}]);

    //marketApp.controller("ReloadPageCtrl", function($location, $scope, $http) {
    //    var url = $location.absUrl()
    //    $scope.reload = function () {
    //        $http.get(url).
    //        success(function (data) {
    //            //$scope.todos = data.todos;
    //            console.log(data)
    //        });
    //
    //    };
    //    $scope.reload();
    //    $interval($scope.reload, 5000);
    //});

//marketApp.controller("CommerceDetailCtrl", function($routeParams, $scope, Commerce) {
//  Commerce.get($routeParams.id).then(function(commerce) {
//    $scope.commerce = commerce;
//  });
//});
//
//marketApp.controller("CommerceListCtrl", function($scope, Commerce) {
//  Commerce.query().then(function(commerces) {
//    $scope.commercesList = commerces;
//  });
//});


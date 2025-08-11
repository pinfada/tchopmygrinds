
// Define the `marketApp` module
	var modules = [
		'ngRoute', 
		'templates', 
		'ui.bootstrap', 
		'rails', 
		'angular-advanced-searchbox',
		'nemLogging',
		'ui-leaflet',
		'Devise',
		'chart.js',
		'angularMoment',
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
				main: "/assets/Templates/main-583cc0fa89d4746a5b4d99329999f1f3a4b7a38d8812a4cabe9d20cacf403089.html",
				header: "/assets/Templates/header-2976fac72c9bcd102166f9ddb4516ee542e64c6fce413b824255865cc5a181dc.html",
				fail: "/assets/Templates/fail-bfddade570795ec527e413f56261920bf04541a444b4a66c7c773736e56b9e2c.html",
				cart: "/assets/Templates/cart-1cc9077404a87de3f90ce54253dfa0b480a97a5611a7c527067708fc25899a73.html",
				checkout: "/assets/Templates/checkout-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.html",
				merchantInterests: "/assets/Templates/merchant_interests-465753b821331ed4f5bc4ff2d4b88d794a62a00c6b2757fc0d3cd7abdce79ec7.html"
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


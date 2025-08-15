
// Define the `marketApp` module
	var modules = [
		'ngRoute', 
		'templates', 
		'ui.bootstrap', 
		'rails', 
		'ui-leaflet'
		// 'angularTrix' - module not available
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
				main: "<%= asset_path('Templates/main.html') %>",
				header: "<%= asset_path('Templates/header.html') %>",
				fail: "<%= asset_path('Templates/fail.html') %>",
				cart: "<%= asset_path('Templates/cart.html') %>",
				checkout: "<%= asset_path('Templates/checkout.html') %>",
				merchantInterests: "<%= asset_path('Templates/merchant_interests.html') %>"
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


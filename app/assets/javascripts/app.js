
// Define the `marketApp` module
	var modules = [
		'ngRoute', 
		'templates', 
		'ui.bootstrap', 
		'rails', 
		'angular-advanced-searchbox',
		'nemLogging',
		'ui-leaflet'
	];
	var marketApp = angular.module('marketApp', modules);

	marketApp.config([
		'$routeProvider', 
		'$locationProvider', 
		function($routeProvider, $locationProvider) {
    	// use the HTML5 History API
    	$locationProvider.html5Mode({
  			enabled: true,
  			requireBase: false
			});
//  	  $locationProvider.hashPrefix('');

    	$routeProvider
			.when('/', {
				controller: 'MainController',
				templateUrl: 'main.html',
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
				templateUrl: 'main.html',
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
	
			.when('/fail', {
				controller: 'FailController',
				templateUrl: 'fail.html',
			});
		
	}]);



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


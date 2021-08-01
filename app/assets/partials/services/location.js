marketApp.factory('myCoordinates', ['$q', '$http', 'myIp', '$geolocation', '$window', function myCoordinates($q, $http, myIp, $geolocation, $window) {
	//Requete https permettant de recupérer mes coordonnées géographiques
	var deferredPromise = null;

	var posOptions = {
		timeout: 60000,
		//maximumAge: 30000, //Accept a cached position whose age is no greater than the specified time in milliseconds
		enableHighAccuracy: false
	};

	var deferred = $q.defer();

	// Using HTML5 geolocation API. Invalide pour les anciens navigateurs
	if ($window.navigator.geolocation) {
		return {
			getCoordinates: function() {
				$geolocation.getCurrentPosition({posOptions}).then(function (position) {
					// This will be executed when the location is accessed
					//console.log("position : ",position);
					//console.log("latitude : ",position.coords.latitude);
					//console.log("longitude : ",position.coords.longitude);
					var myCoordinates = {};
					myCoordinates.lat = position.coords.latitude;
					myCoordinates.lng = position.coords.longitude;
					deferred.resolve(myCoordinates);
				}, function (error) {
					// This will be executed if the user denies access
					// or the browser doesn't support the Geolocation API
					console.log(error);
					//Récupération de l'adresse IP
					myIp.then(function(value) {
						var ip = value.ip;
						console.log("ip : ", value)
						$http({
							method: 'GET',
							url: "https://ipapi.co/"+ip+"/json/"
						}).then(function(response) {
								var myCoordinates = {};
								myCoordinates.lat = response.data.latitude;
								myCoordinates.lng = response.data.longitude;
								deferred.resolve(myCoordinates);
						})
						.catch(function onError(error) {
							console.log(error);
						});
					});
				});
				
				deferredPromise = deferred.promise;
				return deferredPromise;
			}
		}
	} else {
		deferred.reject({message: 'Your browser does not support HTML5 geolocation API.'});
	}
}]);
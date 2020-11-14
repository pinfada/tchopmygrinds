marketApp.factory('myCoordinates', ['$q', '$http', 'myIp', '$geolocation', function myCoordinates($q, $http, myIp, $geolocation) {
	//Requete https permettant de recupérer mes coordonnées géographiques
	var deferredPromise = null;
	return {
		getCoordinates: function() {
			var deferred = $q.defer();
			$geolocation.getCurrentPosition({timeout: 60000}).then(function (position) {
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
				    });
    			});
    		});
    		
			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
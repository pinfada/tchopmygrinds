marketApp.factory('myCoordinates', ['$q', '$http', function myCoordinates($q, $http) {

	var deferred = $q.defer();

    $http({
        method: 'GET',
        url: 'https://ipapi.co/json/'
    }).then(function(response) {
			var myCoordinates = {};
			myCoordinates.lat = response.data.latitude;
			myCoordinates.lng = response.data.longitude;
			myCoordinates.city = response.data.city;
			deferred.resolve(myCoordinates);
    });
	
	return deferred.promise;

}]);
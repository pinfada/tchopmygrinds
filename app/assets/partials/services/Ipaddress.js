marketApp.factory('myIp', ['$q', '$http', function myIp($q, $http) {
	//Requete https permettant de recupérer l'adresse IP de l'utilisateur
	var deferred = $q.defer();

    $http({
        method: 'GET',
        url: 'https://freegeoip.net/json/'
    }).then(function(response) {
			var myIp = {};
			myIp.ip = response.data.ip;
			deferred.resolve(myIp);
    });
	
	return deferred.promise;

}]);
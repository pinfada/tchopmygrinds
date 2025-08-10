marketApp.factory('myIp', ['$q', '$http', '$location', function myIp($q, $http, $location) {
	//Requete https permettant de recupérer l'adresse IP de l'utilisateur
	var deferred = $q.defer();
    var url = $location.absUrl()
    var BASE_URL = url + 'serveraddress'
    // Debug: IP address service URL

    $http({
        method: 'GET',
        url: BASE_URL,
        responseType: 'string'
    //    url: 'https://api.myip.com'
    }).then(function onSuccess(response) {
    // Debug: IP address response data
	//		var myIp = {};
	//		myIp.ip = response.ip;
    //		deferred.resolve(myIp);
            deferred.resolve(response.data)
    })
	.catch(function onError(error) {
	    // Error getting IP address
	});
	
	return deferred.promise;

}]);
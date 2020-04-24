marketApp.factory('myIp', ['$q', '$http', function myIp($q, $http) {
	//Requete https permettant de recupérer l'adresse IP de l'utilisateur
	var deferred = $q.defer();

    $http({
        method: 'GET',
        url: 'https://api.myip.com'
    }).then(function onSuccess(response) {
    		console.log("myIp : ", response)
			var myIp = {};
			myIp.ip = response.ip;
			deferred.resolve(myIp);
    })
	.catch(function onError(error) {
	    console.log(error);
	});
	
	return deferred.promise;

}]);
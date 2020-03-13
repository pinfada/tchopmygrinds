marketApp.factory('myFruitsliste', ['$q', '$http', function myFruitsliste($q, $http) {
	//Requete https permettant de recupérer la liste des fruits et légumes
	//Liste des fruits et légumes récupérée via les données publiques du site Francagri
	var deferred = $q.defer();

    $http({
        method: 'GET',
        url: 'http://localhost:3000/agrimer',
        responseType: 'json'
    }).then(function(response) {
    //        console.log(response.data);
			deferred.resolve(response.data);
    });
	
	return deferred.promise;

}]);
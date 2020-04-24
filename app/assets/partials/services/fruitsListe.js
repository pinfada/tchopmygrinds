marketApp.factory('myFruitsliste', ['$q', '$http', '$location', function myFruitsliste($q, $http, $location) {
	//Requete https permettant de recupérer la liste des fruits et légumes
	//Liste des fruits et légumes récupérée via les données publiques du site Francagri
	var deferred = $q.defer();
    var url = $location.absUrl()
    var BASE_URL = url + 'agrimer'

    $http({
        method: 'GET',
        url: BASE_URL,
        responseType: 'json'
    })
    .then(function onSuccess(response) {
		deferred.resolve(response.data);
    })
    .catch(function onError(error) {
        console.log(error);
    });
	
	return deferred.promise;

}]);
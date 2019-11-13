marketApp.factory("myBoutiques", ['$q', '$http', function myBoutiques($q, $http) {
	//Retourne grace à Mapquest l'ensemble des boutiques situées à proximité de notre position
	var deferredPromise = null;
	return {
		getBoutiques: function(position) {
//			console.log("position:"+position);
			if(position.includes(" "))
            	position=position.replace(" ","+");
			var deferred = $q.defer();
    		$http({
    		    method: 'GET',
    		    url: "https://www.mapquestapi.com/search/v2/search?key=qH6FPb3ABRz7fD8LSYwfTGGhw4QASLSn&maxMatches=10&shapePoints="+position+"&hostedData=mqap.internationalpois|navsics=?|549999"
    		}).then(function(response) {
					var myBoutiques = {};
					myBoutiques.searchResults = response.data.searchResults;
					deferred.resolve(myBoutiques);
    		},
	    		function(error){
	    			console.log("Error Log",error.statusText);
        		}
    		);
			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
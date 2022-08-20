marketApp.factory("myBoutiques", ['$q', '$http', function myBoutiques($q, $http) {
	//Retourne grace à Mapquest l'ensemble des boutiques situées à proximité de notre position
	var deferredPromise = null;
	return {
		getBoutiques: function(position, item, mapkey) {
//			console.log("position:"+position);
//			console.log("item:"+item);
			if(position.includes(" "))
            	position=position.replace(" ","+");
			var deferred = $q.defer();
    		$http({
    		    method: 'GET',
    		    url: "https://www.mapquestapi.com/search/v2/search?key="+mapkey+"&maxMatches="+item+"&shapePoints="+position+"&hostedData=mqap.internationalpois|navsics=?|549910"
    		}).then(function(response) {
					var myBoutiques = {};
					myBoutiques.searchResults = response.data.searchResults;
					//console.log("myBoutiques --> response : ", response);
					deferred.resolve(myBoutiques);
    		},
	    		function(error){
	    			console.log("myBoutiques --> Error Log", error);
        		}
    		);
			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
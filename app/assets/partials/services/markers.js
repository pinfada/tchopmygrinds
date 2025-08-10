//marketApp.factory("myMarkers", ['$q', 'SearchCommerce', function myMarkers($q, SearchCommerce) {
marketApp.factory("myMarkers", ['$q', 'GetMarkers', function myMarkers($q, GetMarkers) {
	
	var deferredPromise = null;
	return {
		getMarkers: function(enseigne) {
//			var boutique_place = [enseigne.shapePoints[0], enseigne.shapePoints[1]];
//			var nom = enseigne.name;
			var nom = angular.lowercase(enseigne.name)
			var deferred = $q.defer();
			GetMarkers.query({name_query:nom}).then(function(commerces) {
				var markers = commerces;
				deferred.resolve({dataReturned: markers, dataName: nom, allData: enseigne});
        	}, function (error) {
        	    // do something about the error
        	    // Error getting marker data
        	    deferred.reject(error);
        	});

			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
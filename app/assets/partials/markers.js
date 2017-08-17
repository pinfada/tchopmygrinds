marketApp.factory("myMarkers", ['$q', 'Commerce', function myMarkers($q, Commerce) {
	
	var deferredPromise = null;
	return {
		getMarkers: function(enseigne) {
//			var boutique_place = [enseigne.shapePoints[0], enseigne.shapePoints[1]];
			var nom = enseigne.name;
			var deferred = $q.defer();
			Commerce.query({query:nom}).then(function(commerces) {
				var markers = commerces;
//				deferred.resolve(markers);
				deferred.resolve({dataReturned: markers, dataName: nom, allData: enseigne});
			//	console.log("enseigne", enseigne);
        	}, function (error) {
        	    // do something about the error
        	    console.log("Error Log",error.statusText);
        	    deferred.reject(error);
        	});

			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
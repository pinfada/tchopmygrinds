marketApp.factory("myCommercenear", ['$q', 'GetCommerceNear', function myCommercenear($q, GetCommerceNear) {
	
	var deferredPromise = null;
	return {
		Getcommercenear: function(latcoord, lngcoord) {
			var deferred = $q.defer();
			// Debug: coordinates for nearby commerce search
			GetCommerceNear.query({lat_query:latcoord, lng_query:lngcoord}).then(function(response) {
				// Debug: commerce search response
				deferred.resolve({response});
        	}, function (error) {
        	    // do something about the error
        	    // Error getting nearby commerces
        	    deferred.reject(error);
        	});

			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
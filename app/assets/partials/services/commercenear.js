marketApp.factory("myCommercenear", ['$q', 'GetCommerceNear', function myCommercenear($q, GetCommerceNear) {
	
	var deferredPromise = null;
	return {
		Getcommercenear: function(latcoord, lngcoord) {
			var deferred = $q.defer();
			//console.log("myCommercenear --> latcoord : ", latcoord)
			//console.log("myCommercenear --> lngcoord : ", lngcoord)
			GetCommerceNear.query({lat_query:latcoord, lng_query:lngcoord}).then(function(response) {
				console.log("myCommercenear --> response : ", response)
				deferred.resolve({response});
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
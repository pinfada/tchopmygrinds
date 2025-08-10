marketApp.factory("myUseraddress", ['$q', 'GetUserAddresses', function myUseraddress($q, GetUserAddresses) {
	
	var deferredPromise = null;
	return {
		Getuseraddress: function(userid) {
			var deferred = $q.defer();
			// Debug: user ID for address lookup
			GetUserAddresses.get({userId: userid}).then(function(address) {
				// Debug: user address retrieved
				deferred.resolve({address});
        	}, function (error) {
        	    // do something about the error
        	    // Error getting user address
        	    deferred.reject(error);
        	});

			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
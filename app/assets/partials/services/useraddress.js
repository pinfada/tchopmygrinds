marketApp.factory("myUseraddress", ['$q', 'GetUserAddresses', function myOrderdetails($q, GetUserAddresses) {
	
	var deferredPromise = null;
	return {
		Getuseraddress: function(userid) {
			var deferred = $q.defer();
			//console.log("myUseraddress --> userid : ", userid)
			GetUserAddresses.get({userId: userid}).then(function(address) {
				//console.log("myUseraddress --> address : ", address)
				deferred.resolve({address});
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
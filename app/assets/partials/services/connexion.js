marketApp.factory("myConnexion", ['$q', 'Auth', function myConnexion($q, Auth) {
	
	var deferredPromise = null;
	return {
		getConnexion: function() {
			var deferred = $q.defer();
			// Debug: Auth service object
			//if (Auth.isAuthenticated() ) {
				Auth.login().then(function(user) {
					var myUserinfo = {};
					myUserinfo.id = user.id
					myUserinfo.name = user.name
			    	if (user.seller_role == true){
			          myUserinfo.isSeller = true;
			          myUserinfo.isBuyer = false;
			    	}
			    	if (user.buyer_role == true){
			    	    myUserinfo.isBuyer = true;
			    	    myUserinfo.isSeller = false;
			    	}
			    	// Debug: user info object created
			    	deferred.resolve(myUserinfo);
				},
	    		function(error){
	    			// Error during user authentication
        		});
			//}

			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
marketApp.factory("myOrderdetails", ['$q', 'GetOrderDetails', function myOrderdetails($q, GetOrderDetails) {
	
	var deferredPromise = null;
	return {
		getOrderdetails: function(productid, orderid) {
			var deferred = $q.defer();
			GetOrderDetails.get({productId: productid, orderId: orderid}).then(function(orderdetail) {
				// Debug: order details retrieved
				deferred.resolve({orderdetail});
        	}, function (error) {
        	    // do something about the error
        	    // Error getting order details
        	    deferred.reject(error);
        	});

			deferredPromise = deferred.promise;
			return deferredPromise;
		}
	};
}]);
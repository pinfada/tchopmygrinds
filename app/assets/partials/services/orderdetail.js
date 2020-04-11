marketApp.factory("myOrderdetails", ['$q', 'GetOrderDetails', function myOrderdetails($q, GetOrderDetails) {
	
	var deferredPromise = null;
	return {
		getOrderdetails: function(productid, orderid) {
			var deferred = $q.defer();
			GetOrderDetails.get({productId: productid, orderId: orderid}).then(function(orderdetail) {
				//console.log("myOrderdetails --> orderdetail : ", orderdetail)
				deferred.resolve({orderdetail});
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
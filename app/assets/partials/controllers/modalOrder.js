marketApp.controller("modalOrder", [
    '$q', 
    '$scope',
    '$uibModalInstance', 
    '$log', 
    '$route',
    '$window',
    'boutique', 
    'user',
    'GetCommerceProducts',
    'GetProductOrders',
    'myOrderdetails',
    'UpdateOrderDetails',
    function ($q, $scope, $uibModalInstance, $log, $route, $window, boutique, user, GetCommerceProducts, GetProductOrders, myOrderdetails, UpdateOrderDetails){

    var deferred = $q.defer();

    // Récupération de la liste des produits pour un commerce
    GetCommerceProducts.get({commerceId: boutique.id}).then(function (products) {
        //console.log("produits :", products)
        $scope.nbproduit = products.length
        $scope.produits = products
        
    }, function (error) {
        // do something about the error
        console.log("Error Log",error.statusText);
        deferred.reject(error);
    });

    $scope.$on('ngCart:checkout_succeeded', function(event, cart) {
        //console.log("modalOrder --> cart : ", cart)
        angular.forEach(cart, function(obj1, key) {
            //console.log("modalOrder --> obj1 : ", obj1.items)
            var product = obj1.items
            var nbproduct = product.length

            for(var i=0; i<nbproduct; i++) {
                var result = product[i];
                var result_id = result.id

                var data = {
                    orderdate: new Date().toISOString().slice(0,10),
                    requiredate: new Date().toISOString().slice(0,10),
                    shippedate: '',
                    status: 0,
                    userId: user.id,
                    productId: result_id
                }
                $log.log('Submiting order info.'); // kinda console logs this statement
                $log.log(data);
                new GetProductOrders(data).create().then(function (order) {
                    //console.log("modalOrder --> order : ", order)

                    var userid = order.userId;
                    var orderid = order.id;
                    var price = result.total;
                    var quantity = result.quantity;

                    myOrderdetails.getOrderdetails(result_id, orderid).then(function (response) {
                        //console.log("modalOrder --> updatedetail : ", response)
                        angular.forEach(response, function(detail, key) {
                            console.log("modalOrder --> detail : ", detail)
                            for(var p=0; p<detail.length; p++) {
                                var data = detail[p];
                                var data_id = data.id
                                var updatedetail = {
                                    unitprice: price,
                                    quantity: quantity,
                                    productId: result_id,
                                    orderId: orderid,
                                    id: data_id
                                }
                                $log.log('Submiting orderdetail info.'); // kinda console logs this statement
                                $log.log(updatedetail);
                                new UpdateOrderDetails(updatedetail).update()
                            } 

                        })
                    })
                    
                })
            }
            $uibModalInstance.close('cancel');
            $route.reload();
            //$window.location.reload();
        })
    });


    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.submit = function (dataselect) {
        $uibModalInstance.close(false); 
    };

}]);
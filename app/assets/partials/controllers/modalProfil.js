marketApp.controller("modalProfil", [
    '$q', 
    '$scope',
    '$uibModalInstance', 
    '$log', 
    '$route',
    'boutique', 
    'user',
    'GetCommerceProducts',
    'GetProductOrders',
    'myOrderdetails',
    'UpdateOrderDetails',
    function ($q, $scope, $uibModalInstance, $log, $route, boutique, user, GetCommerceProducts, GetProductOrders, myOrderdetails, UpdateOrderDetails){

    console.log('ModalProfil')
    $scope.foo = "Lorem Ipsum is simply dummy text of the printing and typesetting industry."+ 
                 "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,"+ 
                 "when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

}]);
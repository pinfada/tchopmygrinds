marketApp.directive('header', function(){
    return {
        restrict: 'A',
        templateUrl: 'header.html',
        scope: true,
        transclude : false,
        controller: 'HeaderController'
    };
});
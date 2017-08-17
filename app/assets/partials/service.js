marketApp.factory("Commerce", ['railsResourceFactory', function(railsResourceFactory) {
  return railsResourceFactory({ url: "/commerces/search", name: "commerce" });
}]);
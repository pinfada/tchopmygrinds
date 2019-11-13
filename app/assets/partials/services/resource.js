//Permet de faire un requete sur à partir du nom du commerce
marketApp.factory("SearchCommerce", ['railsResourceFactory', function(railsResourceFactory) {
  return railsResourceFactory({ url: "/commerces/search", name: "Searchcommerce" });
}]);

marketApp.factory("SearchProduct", ['railsResourceFactory', function(railsResourceFactory) {
  return railsResourceFactory({ 
          url: "/products/listproduct", 
          name: "Searchproduct"
  });
}]);

marketApp.factory("SearchCommerce", ['railsResourceFactory', function(railsResourceFactory) {
  return railsResourceFactory({ 
          url: "/products/listcommerce", 
          name: "Searchcommerce"
  });
}]);

marketApp.factory("GetAllCommerce", ['railsResourceFactory', 'railsSerializer', function(railsResourceFactory, railsSerializer) {
  return railsResourceFactory({ 
          url: "/commerces", 
          name: "commerce" ,
          serializer: railsSerializer(function () {
            this.resource('products', 'Product');
          })
  });
}]);

marketApp.factory("GetAllProduct", ['railsResourceFactory', function(railsResourceFactory) {
  return railsResourceFactory({ 
          url: "/products", 
          name: "product" 
  });
}]);

marketApp.factory("GetCommerceProducts", ['railsResourceFactory', 'railsSerializer', function(railsResourceFactory, railsSerializer) {
  return railsResourceFactory({
          url: "/commerces/{{commerceid}}/products", 
          name: "product",
          serializer: railsSerializer(function () {
            this.nestedAttribute('commerces', 'Commerce');
          })
  });
}]);
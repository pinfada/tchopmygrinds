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

// Renvoi la liste complete des commerces
marketApp.factory("GetAllCommerce", ['railsResourceFactory', 'railsSerializer', function(railsResourceFactory, railsSerializer) {
  return railsResourceFactory({ 
          url: "/commerces", 
          name: "commerce" ,
          serializer: railsSerializer(function () {
            this.resource('products', 'Product');
          })
  });
}]);

// Renvoi la liste complete des produits
marketApp.factory("GetAllProduct", ['railsResourceFactory', function(railsResourceFactory) {
  return railsResourceFactory({ 
          url: "/products", 
          name: "product" 
  });
}]);

// Renvoie la liste des produits pour un commerce
marketApp.factory("GetCommerceProducts", ['railsResourceFactory', 'railsSerializer', function(railsResourceFactory, railsSerializer) {
  return railsResourceFactory({
          url: "/commerces/{{commerceid}}/products", 
          name: "product",
          serializer: railsSerializer(function () {
            this.nestedAttribute('commerces', 'Commerce');
          })
  });
}]);

// Renvoi la Liste des commerces d'un utilisateur
marketApp.factory("GetUserCommerces", ['railsResourceFactory', 'railsSerializer', function(railsResourceFactory, railsSerializer) {
  return railsResourceFactory({
          url: "/users/{{userid}}/commerces", 
          name: "usercommerces",
          serializer: railsSerializer(function () {
            this.nestedAttribute('users', 'User');
          })
  });
}]);
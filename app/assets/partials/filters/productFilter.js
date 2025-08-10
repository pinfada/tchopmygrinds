marketApp.filter('productFilter', ['SearchProduct', 'myIp', function(SearchProduct, myIp) {

    return function(input){
        // Debug: filter input data
        // verifier que la donnée fournie est renseignée
        if (!input || input.length === 0) {
            // Debug: empty input data
            return input;
        } else {
            myIp.then(function(item) {
                SearchProduct.query({name_query:input.name, ip_query:item.ip}).then(function (results) {
                    if (results.length > 0) {
                        // Debug: filter results found
                    }
                    // Debug: filter output data
                    return input;
                }, function (error) {
                    // do something about the error
                    // Error in product filter search
                });
            });
        }
    };
 }]);
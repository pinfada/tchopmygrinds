marketApp.filter('productFilter', ['SearchProduct', 'myIp', function(SearchProduct, myIp) {

    return function(input){
        console.log("donnée en entrée : ", input);
        // verifier que la donnée fournie est renseignée
        if (!input || input.length === 0) {
            console.log("donnée vide", input);
            return input;
        } else {
            myIp.then(function(item) {
                SearchProduct.query({name_query:input.name, ip_query:item.ip}).then(function (results) {
                    if (results.length > 0) {
                        console.log(results, input);
                    }
                    //console.log("donnée en sortie : ", input);
                    return input;
                }, function (error) {
                    // do something about the error
                    console.log("Error Log",error.statusText);
                });
            });
        }
    };
 }]);
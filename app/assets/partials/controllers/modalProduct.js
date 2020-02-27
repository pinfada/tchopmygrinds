marketApp.controller("modalProduct", ['$q', '$scope','$uibModalInstance', '$log', '$route', 'GetAllCommerce', 'GetCommerceProducts', 'commerce', 'myFruitsliste', 'moment',  function ($q, $scope, $uibModalInstance, $log, $route, GetAllCommerce, GetCommerceProducts, commerce, myFruitsliste, moment){

    //var deferred = $q.defer();
    $scope.SeeGraph = false;

    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };
    
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-3' }];
    
    $scope.series = ['min', 'max', 'moyen'];
    
    $scope.options = {
      title: {
        display: true,
        text: 'Prix fruits et légumes',
        fontColor: 'lightblue',
        fontSize: 16
      },
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'right'
          },
          {
            id: 'y-axis-2',
            type: 'linear',
            display: true,
            position: 'left'
          },
          {
            id: 'y-axis-3',
            type: 'linear',
            display: false,
            position: 'right'
          }
        ],
        xAxes: [{
            type: 'time',
            position: 'bottom',
            time: {
              tooltipFormat: 'YYYY-MM-DD',
              displayFormats: {
                  hour: 'YYYY-MM-DD',
                  day: 'YYYY-MM-DD',
                  week: 'YYYY-MM-DD'
              }
            }
        }]
      }
    };

    // Start as not visible but when button is tapped it will show as true 
    $scope.visible = false;
                                    
    //Liste des produits selectionnables par les commercants
    myFruitsliste.then(function(value) {
        $scope.fruits = value;
    });

    //vérification présence du commerce en base et récupération de l'id
    //GetAllCommerce.query().then(function(commerce){
    //    var recupid = commerce.filter(function(item) {
    //        return item.name === name;
    //    })[0];
    //    deferred.resolve(recupid);
    //}, function (error) {
    //    // do something about the error
    //    console.log("Error Log",error.statusText);
    //    deferred.reject(error);
    //});
    
	//var p = deferred.promise;

    // Create the array to hold the list of Products
    $scope.produits = [];
    // Create the function to push the data into the "produits" array
    $scope.newProduit = function (donnee) {
    //    p.then(function(value) {
            $scope.name = donnee.name;
            $scope.prix = donnee.prix;
            $scope.quantite = donnee.quantite;
            $scope.stock = donnee.stock;
            $scope.discontinued = donnee.discontinued;
            $scope.produits.push({name:$scope.name, unitprice:$scope.prix, quantityperunit:$scope.quantite, discontinued:$scope.discontinued, unitsinstock:$scope.stock, commerceid: commerce});
            $scope.name = $scope.prix = $scope.quantite ="";
            $scope.SeeGraph = true;
    //    });
    };
    
    $scope.findValue = function(newValue, oldValue) { 
        $scope.results = [];
        var mini = [];
        var maxi = [];
        var moyen = [];
        $scope.date = [];
        $scope.labels = [];
        var d1 = "";
        var lgrValue = newValue.length;
        var last = newValue[lgrValue - 1];
        if(typeof last !== "undefined") {
            var nom_produit = last.name;
            console.log(nom_produit);
            angular.forEach($scope.fruits, function(item) {
                if (item.produit === nom_produit) {
                    $scope.results.push({produit: item.produit, prix: item.Moyen, date: item.Date});
                    mini.push(Number(item.Mini));
                    maxi.push(Number(item.Maxi));
                    moyen.push(Number(item.Moyen));
                    d1 = moment(item.Date, "DD/MM/YYYY");
                    $scope.labels.push(d1);
                }
            });
        }
        
        $scope.data = [
          mini,
          maxi,
          moyen
        ];
        
        //var nums = mini.concat(maxi, moyen);
        //var nbmax = Math.max(nums);
        //var nbmin = Math.min(nums);
    
    };
    
    $scope.remove = function(index){
      $scope.produits.splice(index, 1);
    };
    
    //Observation changement d'état de la variable $scope.produits
    $scope.$watchCollection('produits', $scope.findValue);
    
    $scope.cancel = function () {
        $uibModalInstance.close(false); 
    };
    
    $scope.submit = function () {
        var total = $scope.produits.length;
        for(var i=0; i<total; i++) {
            var result = $scope.produits[i];
            $log.log('Submiting product info.'); // kinda console logs this statement
            $log.log(result);
            new GetCommerceProducts(
                result 
            ).create();
            $uibModalInstance.close('cancel');
            $route.reload();
        }
    };

}]);
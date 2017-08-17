// Define the `PhoneListController` controller on the `phonecatApp` module
marketApp.controller('HeaderController', ['$scope',  function HeaderController($scope) {
    $scope.SeeSearch = false;
    $scope.SeeMap = false;

    $scope.searchParams = {
        "query":""
    };
    

    $scope.records = [
        {fruit: "Patate douce"  , quantite: "20"},
        {fruit: "Igname"        , quantite: "15"},
        {fruit: "Pomme de terre", quantite: "33"},
        {fruit: "Manioc"        , quantite: "11"},
        {fruit: "Macabo"        , quantite: "3"},
        {fruit: "Plantain"      , quantite: "25"}
    ];    

    $scope.selectedIndex = 0;
    
    $scope.itemClicked = function ($index) {
    //  console.log($index);
      $scope.selectedIndex = $index;
    };

    $scope.availableSearchParams = [
      { key: "céréales", name: "Céreales", placeholder: "Céreales..." },
      { key: "tubercules", name: "Tubercules", placeholder: "Tubercules...", suggestedValues: ['Citibank', 'JP Morgan', 'Bank of America'] },
      { key: "fruits", name: "Fruits", placeholder: "Fruits...", restrictToSuggestedValues: false, suggestedValues: ['New York', 'Dallas', 'Chicago', 'London', 'Paris'] },
      { key: "légumes", name: "Légumes", placeholder: "Légumes..", restrictToSuggestedValues: true, suggestedValues: ['Oignons', 'Haricots', 'Gombo', 'Choux', 'Echalotte'] },
      { key: "épices", name: "Epices", placeholder: "Epices..." }
    ];
}]);
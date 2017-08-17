(function() {
    'use strict';
    var module = angular.module('marketApp');


module.controller('MainController', [
    '$scope',
    '$compile',
    '$window',
    '$uibModal',
    '$log',
    '$http',
    'nemSimpleLogger',
    'leafletData',
    'coordinates', 
    'myCoordinates', 
    'markers', 
    'boutiques',
    'myBoutiques',
    'Commerce',
    function($scope, $compile, $window,  $uibModal, $log, $http, nemSimpleLogger, leafletData, coordinates, myCoordinates, markers, boutiques, myBoutiques, Commerce) {
        
        var map = null;
        var mapquest_key = 'qH6FPb3ABRz7fD8LSYwfTGGhw4QASLSn';

        nemSimpleLogger.doLog = true; //default is true 
        nemSimpleLogger.currentLevel = nemSimpleLogger.LEVELS.debug;//defaults to error only 

        L.mapquest.key = mapquest_key; //Cle API mapquest
        L.mapquest.open = true; // Permet d'utiliser les fonctionnalités de openstreet
        var tileLayer = L.mapquest.tileLayer('map');

        // 'map' refers to a <div> element with the ID map
        var map = L.mapquest.map('map', {
            center: [coordinates.lat, coordinates.lng],
            layers: [tileLayer],
            zoom: 12
        });
        
        // Controle de la map (localisation, zoom etc...)
        map.addControl(L.mapquest.control());
          
        // Customisation des Icons utiliser pour la map
        var customIcon = 
        L.mapquest.icons.marker({
          primaryColor: '#22407F',
          secondaryColor: '#3B5998',
          shadow: true,
          size: 'md'
//          symbol: 'A'
        });
        

        // Récupération des coordonnées(x,y) des boutiques et affichage sur la map
	    boutiques.getBoutiques([coordinates.lat, coordinates.lng]).then(function (boutique) {
            angular.forEach(boutique, function(obj1, key) {
                var total = obj1.length;
                for(var i=0; i<total; i++) {
                    var commentaire = ' ';
                    var result = obj1[i];
                     // Rechercher tous les commerces qui ont le meme nom
            	    markers.getMarkers(result).then(function (response) {
                        //console.log("controle markers response : " , response);
                        if (response.dataReturned == true) {
                            commentaire = 'est adh&eacuterent.';
                        //    console.log("---- boutiques presentes : " , response.dataName);
                        } else {
                            commentaire = 'nest pas adh&eacuterent. Pour adh&eacuterer <button class="btn" ng-click="open'+ response.allData.resultNumber +'()"> Cliquez moi :)     </button>';
                        //    console.log("---- boutiques absentes  : " , response.dataName);
                        }
                        // Récupération des coordonnées de l'enseigne commerciale
                        var boutique_place = [response.allData.shapePoints[0], response.allData.shapePoints[1]];
                        
                        // Affichage de chaque POI grace au resultNumber
                        $('#map').on('click', '.doGreeting'+ response.allData.resultNumber, function() {
                            $window.alert(response.dataName);
                        });
                        
                        var commerce = 'commerce'+response.allData.resultNumber;

                        $scope[commerce] = {
                            name: response.allData.fields.name,
                            adress1: response.allData.fields.address,
                            adress2: '',
                            details: '',
                            postal: response.allData.fields.postal_code,
                            country:'FR',
                            latitude: response.allData.fields.lat,
                            longitude: response.allData.fields.lng,
                            city: response.allData.fields.city
                        };
                        
                        console.log("test : ", $scope[commerce]);
                        
                        var open = 'open'+response.allData.resultNumber;
                        var submit = 'submit'+response.allData.resultNumber;
                        var cancel = 'cancel'+response.allData.resultNumber;

                        $scope[open] = function () {
                            $uibModal.open({
                                templateUrl: 'myModalContent.html', // loads the template
                                backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                                windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
                                controller: function ($scope, $uibModalInstance, $log, commerce) {
                                    console.log("commerce : ", commerce);
                                    $scope.commerce = commerce;
                                    $scope[submit] = function () {
                                        $log.log('Submiting commerce info.'); // kinda console logs this statement
                                        $log.log(commerce);
                                        $http({
                                        method: 'POST', 
                                        url: 'https://0.0.0.0:8080/commerces',
                                        headers: {
                                            "Content-type": undefined
                                        }
                                        , data: commerce
                                    }).then(function (response) {
                                        console.log(response);
                                       $uibModalInstance.dismiss('cancel'); 
                                    }, function (response) {
                                        console.log('i am in error');
                                       $uibModalInstance.dismiss('cancel'); 
                                        });
                                    };
                                    $scope[cancel] = function () {
                                        $uibModalInstance.dismiss('cancel'); 
                                    };
                                },
                                resolve: {
                                    commerce: function () {
                                        return $scope.commerce;
                                    }
                                }
                            });//end of modal.open
                        }; // end of scope.open function
                        
                        
                        var html =  
                                "<div>"
                                +"    <script type='text/ng-template' id='myModalContent.html'>"
                                +"        <div class='modal-header'>"
                                +"            <h3>My modal!</h3>"
                                +"        </div>"
                                +"        <form ng-submit='submit"+ response.allData.resultNumber +"()'>"
                                +"          <div class='modal-body'>"
                                +"              <div class='form-group'>"
                                +"                  <label class='control-label'>Nom du commerce:</label>"
                                +"                  <input class='form-control' type='text' ng-model='commerce.name' />"
                                +"              </div>"
                                +"              <div class='form-group'>"
                                +"                  <label class='control-label'>Adresse</label>"
                                +"                  <input class='form-control' type='text' ng-model='commerce.adress1' />"
                                +"              </div>"
                                +"              <div class='form-group'>"
                                +"                  <label class='control-label'>Adresse complémentaire</label>"
                                +"                  <input class='form-control' type='text' ng-model='commerce.adress2' />"
                                +"              </div>"
                                +"              <div class='form-group'>"
                                +"                  <label class='control-label'>Ville</label>"
                                +"                  <input class='form-control' type='text' ng-model='commerce.city' />"
                                +"              </div>"
                                +"              <div class='form-group'>"
                                +"                  <label class='control-label'>code postal</label>"
                                +"                  <input class='form-control' type='text' ng-model='commerce.postal' />"
                                +"              </div>"
                                +"          </div>"
                                +"          <div class='modal-footer'>"
                                +"              <button class='btn btn-warning' ng-click='cancel"+ response.allData.resultNumber +"()'>Cancel</button>"
                                +"              <input type='submit' class='btn primary-btn' value='Submit' />"
                                +"          </div>"
                                +"        </form>"
                                +"    </script>"
                                +"    <button class='btn' ng-click='open"+ response.allData.resultNumber +"()'>Open Modal</button>"
                                +"</div>";
                        
                        // Compile title DOM into a link function
                        var linkFn = $compile(angular.element(html));
                        
                        // Return a jQuery DOM tree fully controlled by AngularJS so that ng directives will work
                        var popup = linkFn($scope);
                        
                        var popup_content = '<div><strong>' + response.dataName + ' </strong> situé au ' + response.allData.fields.address + ' ' + commentaire + '</div>';
                        
                        var customPopup = L.popup()
                            .setLatLng(boutique_place)
                            .setContent(popup[0])
                            .openOn(map);

                        L.marker(boutique_place, {icon: customIcon}).bindPopup(customPopup).addTo(map);
            	    },
            	    	function(error){
            	    		console.log("Error Log",error.statusText);
                    	}
            	    );
                }
            });
	    });   

    }]);

})();
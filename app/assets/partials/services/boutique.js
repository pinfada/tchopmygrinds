// MapQuest supprimé: service neutralisé en attendant une source de données interne
marketApp.factory("myBoutiques", ['$q', function myBoutiques($q) {
    return {
        getBoutiques: function(position, item, mapkey) {
            var deferred = $q.defer();
            deferred.resolve({ searchResults: [] });
            return deferred.promise;
        }
    };
}]);
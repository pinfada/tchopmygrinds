marketApp.factory('myPosition', ['$window', '$rootScope', function myPosition($window, $rootScope) {

	function supported() {
		return 'geolocation' in $window.navigator;
	}
    // GeoLocation
    var coordinates = []
	var retVal = {
		getPosition: function(options) {
			if(supported()) {
				if(!this.watchId) {
					this.watchId = $window.navigator.geolocation.watchPosition(
						function(position) {
							//coordinates.push([position.coords.latitude, position.coords.longitude]);
							//console.log("coordinates : ", coordinates)
							$rootScope.$apply(function() {
								retVal.latitude = position.coords.latitude;
								retVal.longitude = position.coords.longitude;
								retVal.timestamp = position.timestamp;
								delete retVal.error;
								$rootScope.$broadcast('$geolocation.position.changed', position);
							});
						},
						function(error) {
							$rootScope.$apply(function() {
								retVal.position.error = error;
								delete retVal.latitude;
								delete retVal.longitude;
								delete retVal.timestamp;
								$rootScope.$broadcast('$geolocation.position.error', error);
							});
						}, options);
				}
			} else {
				retVal = {
					error: {
						code: 2,
						message: 'This web browser does not support HTML5 Geolocation'
					}
				};
			}
		},

		clearWatch: function() {
			if(this.watchId) {
				$window.navigator.geolocation.clearWatch(this.watchId);
				delete this.watchId;
			}
		},

		position: {}
	};
	//console.log("retval : ", retVal)
	return retVal;
}]);
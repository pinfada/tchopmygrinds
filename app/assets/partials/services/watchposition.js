marketApp.factory('myPosition', ['$window', '$rootScope', function myPosition($window, $rootScope) {

	function supported() {
		return 'geolocation' in $window.navigator;
	}
    // GeoLocation
	var retVal = {
		getPosition: function(options) {
			if(supported()) {
				if(!this.watchId) {
					this.watchId = $window.navigator.geolocation.watchPosition(
						function(position) {
							$rootScope.$apply(function() {
								retVal.latitude = position.coords.latitude;
								retVal.longitude = position.coords.longitude;
								retVal.timestamp = position.timestamp;
								// Debug: position watch updated
								delete retVal.error;
								$rootScope.$broadcast('geolocationStateChanged', retVal);
								//$rootScope.$broadcast('$geolocation.position.changed', retVal);
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
	// Debug: position service initialized
	return retVal;
}]);
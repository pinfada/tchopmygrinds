/*
 * L.Icon.SensorDefault is the blue marker icon with white 'wi-fi' symbol used
 * by default for sensor positions. It behaves like DefaultIcon on all other accounts.
 */

L.Icon.SensorDefault = L.Icon.Default.extend({
  _getIconUrl: function (name) {
    var key = name + 'Url';

    if (this.options[key]) {
      return this.options[key];
    }

    if (L.Browser.retina && name === 'icon') {
      name += '-2x';
    }

    if (L.Browser.retina && name === 'icon') {
      return "/assets/map/marker/sensor-2x-7909a41f12d132d6010a30e87ac3ef7e4c0d093b88b6c3bc340db474724f8190.png";
    }
    if (name === 'shadow') {
      return "/assets/map/marker/shadow-a3639d3325eaf63195ec85c11cc839e2537ffd9ce0ecb231b3c0c3bc97d9bfbd.png";
    } else {
      return "/assets/map/marker/sensor-8736e0c49a93db004d635e6fc3d1fa586150d83aefbea4931eabc65d6ad8a41b.png";
    }


    return path + '/marker-' + name + '.png';
  }
});

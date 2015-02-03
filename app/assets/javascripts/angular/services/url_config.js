angular.module("Prometheus.services").factory('URLConfigDecoder', function($location) {
  return function(defaultHash) {
    var hash = $location.hash() || defaultHash;
    if (!hash) {
      return {};
    }
    // Decodes UTF-8.
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings
    var configJSON = unescape(decodeURIComponent(window.atob(hash)));
    var config = JSON.parse(configJSON);
    return config;
  };
});

angular.module("Prometheus.services").factory('URLHashEncoder', ["URLConfigDecoder", function(URLConfigDecoder) {
  return function(config) {
    var urlConfig = URLConfigDecoder();
    for (var o in config) {
      urlConfig[o] = config[o];
    }
    var configJSON = JSON.stringify(urlConfig);
    // Encodes UTF-8.
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings
    return window.btoa(encodeURIComponent(escape(configJSON)));
  };
}]);

angular.module("Prometheus.services").factory('URLConfigEncoder', ["$location", "URLHashEncoder", function($location, URLHashEncoder) {
  return function(config) {
    $location.hash(URLHashEncoder(config));
  };
}]);

angular.module("Prometheus.services").factory('URLVariablesDecoder', ['$location', function($location) {
  return function() {
    return $location.search();
  };
}]);

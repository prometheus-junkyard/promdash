angular.module("Prometheus.services").factory('UrlConfigDecoder', function($location) {
  return function(defaultHash) {
    var hash = $location.hash() || defaultHash;
    if (!hash) {
      return {};
    }
    // Decodes UTF-8
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings
    var configJSON = unescape(decodeURIComponent(window.atob(hash)));
    var config = JSON.parse(configJSON);
    return config;
  };
});

angular.module("Prometheus.services").factory('UrlHashEncoder', ["UrlConfigDecoder", function(UrlConfigDecoder) {
  return function(config) {
    var urlConfig = UrlConfigDecoder();
    for (var o in config) {
      urlConfig[o] = config[o];
    }
    var configJSON = JSON.stringify(urlConfig);
    // Encodes UTF-8
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings
    return window.btoa(encodeURIComponent(escape(configJSON)));
  };
}]);

angular.module("Prometheus.services").factory('UrlConfigEncoder', ["$location", "UrlHashEncoder", function($location, UrlHashEncoder) {
  return function(config) {
    $location.hash(UrlHashEncoder(config));
  };
}]);

angular.module("Prometheus.services").factory('UrlVariablesDecoder', function($location) {
  return function() {
    return $location.search();
  };
});

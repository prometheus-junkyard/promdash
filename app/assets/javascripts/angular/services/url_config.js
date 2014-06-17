angular.module("Prometheus.services").factory('UrlConfigDecoder', function($location) {
  return function(defaultHash) {
    var hash = $location.hash() || defaultHash;
    if (!hash) {
      return {};
    }
    var configJSON = atob(hash);
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
    return btoa(configJSON);
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

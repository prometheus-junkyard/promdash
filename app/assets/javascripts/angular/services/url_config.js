angular.module("Prometheus.services").factory('UrlConfigDecoder', function($location) {
  return function() {
    var hash = $location.hash();
    if (!hash) {
      return {};
    }
    var configJSON = atob(hash);
    var config = JSON.parse(configJSON);
    return config;
  };
});

angular.module("Prometheus.services").factory('UrlConfigEncoder', function($location, UrlConfigDecoder) {
  return function(config) {
    var urlConfig = UrlConfigDecoder();
    for (var o in config) {
      urlConfig[o] = config[o];
    }
    var configJSON = JSON.stringify(urlConfig);
    $location.hash(btoa(configJSON));
  };
});

angular.module("Prometheus.services").factory('UrlVariablesDecoder', function($location) {
  return function() {
    return $location.search();
  };
});

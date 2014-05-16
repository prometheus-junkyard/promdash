angular.module("Prometheus.services").factory('MetricNamesQuerier', ["$http", function($http) {
  var metricNamesCache = {};

  return function(server_id, url, scope) {
    if (metricNamesCache[server_id]) {
      scope.metricNames = metricNamesCache[server_id];
      return;
    }

    $http.get(url + 'api/metrics').success(function(metricNames) {
      metricNamesCache[server_id] = metricNames;
      scope.metricNames = metricNames;
      return;
    }).error(function() {
      console.log("Error loading available metrics!");
    });
  }
}]);

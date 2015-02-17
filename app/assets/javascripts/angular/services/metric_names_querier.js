angular.module("Prometheus.services").factory('MetricNamesQuerier', ["$http", "URLGenerator", function($http, URLGenerator) {
  var metricNamesCache = {};

  return function(serverID, serverURL, scope) {
    if (metricNamesCache[serverID]) {
      scope.metricNames = metricNamesCache[serverID];
      return;
    }
    $http.get(URLGenerator(serverURL, '/api/metrics')).success(function(metricNames) {
      metricNamesCache[serverID] = metricNames;
      scope.metricNames = metricNames;
      return;
    }).error(function() {
      console.log("Error loading available metrics!");
    });
  };
}]);

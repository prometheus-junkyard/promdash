angular.module("Prometheus.services").factory('MetricNamesQuerier', ["$http", function($http) {
  var metricNamesCache = {};

  return function(serverID, url, scope) {
    if (metricNamesCache[serverID]) {
      scope.metricNames = metricNamesCache[serverID];
      return;
    }

    $http.get(url + 'api/metrics').success(function(metricNames) {
      metricNamesCache[serverID] = metricNames;
      scope.metricNames = metricNames;
      return;
    }).error(function() {
      console.log("Error loading available metrics!");
    });
  }
}]);

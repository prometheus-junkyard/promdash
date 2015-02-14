angular.module("Prometheus.services").factory('MetricNamesQuerier', ["$http", function($http) {
  var metricNamesCache = {};

  return function(serverID, serverURL, scope) {
    if (metricNamesCache[serverID]) {
      scope.metricNames = metricNamesCache[serverID];
      return;
    }
    var url = document.createElement('a');
    url.href = serverURL;
    url.pathname = url.pathname.replace(/\/?$/, '/api/metrics');
    $http.get(url.href).success(function(metricNames) {
      metricNamesCache[serverID] = metricNames;
      scope.metricNames = metricNames;
      return;
    }).error(function() {
      console.log("Error loading available metrics!");
    });
  };
}]);

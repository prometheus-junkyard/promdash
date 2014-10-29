angular.module("Prometheus.services").factory('AnnotationRefresher', ["$http", function($http) {
  return function(graph, scope) {
    var tags = graph.tags.map(function(e) {
      if (e.name) {
        return e.name.split(",").map(function(s) { return s.trim(); });
      } else {
        return "";
      }
    })
    if (tags.length) {
      var range = Prometheus.Graph.parseDuration(graph.range);
      var until = Math.floor(graph.endTime || Date.now()) / 1000;

      tags.forEach(function(t) {
        $http.get('/annotations', {
          params: {
            tags: t.join(","),
            until: until,
            range: range
          }
        })
        .then(function(payload) {
          scope.$broadcast('annotateGraph', payload.data.posts);
        }, function(response) {
          scope.errorMessages.push("Error " + response.status + ": Error occurred fetching annotations.");
        });
      });
    }
  };
}]);

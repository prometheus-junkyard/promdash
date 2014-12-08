angular.module("Prometheus.services").factory('AnnotationRefresher', ["$http", "VariableInterpolator", function($http, VariableInterpolator) {
  return function(graph, scope) {
    var tags = graph.tags.map(function(e) {
      if (e.name) {
        var n = VariableInterpolator(e.name, scope.vars);
        return n.split(",").map(function(s) { return s.trim(); });
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
            'tags[]': t,
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

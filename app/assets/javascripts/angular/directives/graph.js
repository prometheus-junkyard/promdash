angular.module("Prometheus.directives").directive('graph', function() {
  return {
    scope: {
      graph: "=graphSettings",
      serversById: "=servers",
      globalEndTime: "=globalEndTime"
    },
    restrict: "AE",
    templateUrl: "/graph_template.html"
  };
});

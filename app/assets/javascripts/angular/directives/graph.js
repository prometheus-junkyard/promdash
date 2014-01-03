angular.module("Prometheus.directives").directive('graph', function() {
  return {
    scope: {
      graph: "=graphSettings",
      servers: "=servers",
      globalEndTime: "=globalEndTime",
      index: "="
    },
    restrict: "AE",
    templateUrl: "/graph_template.html"
  };
});

angular.module("Prometheus.directives").directive('graph', function() {
  return {
    scope: {
      graph: "=graphSettings",
      servers: "=servers",
      globalEndTime: "=globalEndTime",
      globalConfig: "=globalConfig",
      frameHeight: "&",
      index: "="
    },
    restrict: "AE",
    templateUrl: "/graph_template.html"
  };
});

angular.module("Prometheus.directives").directive('inlineFrame', function() {
  return {
    scope: {
      frame: "=frameSettings"
    },
    restrict: "AE",
    templateUrl: "/frame_template.html"
  };
});

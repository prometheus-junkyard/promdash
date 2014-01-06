angular.module("Prometheus.directives").directive('inlineFrame', function() {
  return {
    scope: {
      frame: "=frameSettings",
      frameHeight: "&",
      index: "="
    },
    restrict: "AE",
    templateUrl: "/frame_template.html"
  };
});

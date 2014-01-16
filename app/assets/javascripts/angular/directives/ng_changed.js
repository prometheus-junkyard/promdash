angular.module("Prometheus.directives").directive('ngChanged', function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      element.bind("change", function() {
        scope.$eval(attrs.ngChanged);
      });
    }
  };
});

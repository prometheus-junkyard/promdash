angular.module("Prometheus.services").factory('WidgetHeightCalculator', [function() {
  return function(element, aspectRatio) {
    aspectRatio = aspectRatio || 3/4;
    return $(element).outerWidth() * aspectRatio;
  };
}]);

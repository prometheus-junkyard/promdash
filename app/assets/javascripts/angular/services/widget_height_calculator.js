angular.module("Prometheus.services").factory('WidgetHeightCalculator', [function() {
  return function(element, aspectRatio) {
    aspectRatio = aspectRatio || 3/4;
    graphWidth = $(element).outerWidth()
    return graphWidth * aspectRatio;
  };
}]);

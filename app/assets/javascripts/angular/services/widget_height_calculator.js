angular.module("Prometheus.services").factory('WidgetHeightCalculator', [function() {
  return function(element, aspectRatio) {
    aspectRatio = aspectRatio || 3/4;
    var elementStyle = window.getComputedStyle(element, null);
    var graphWidth = parseInt(elementStyle.getPropertyValue('width'), 10);
    return graphWidth * aspectRatio;
  };
}]);

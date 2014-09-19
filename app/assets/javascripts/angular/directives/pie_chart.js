angular.module("Prometheus.directives").directive('pieChart', ["$location", "WidgetHeightCalculator", "VariableInterpolator", "RickshawDataTransformer", "YAxisUtilities", function($location, WidgetHeightCalculator, VariableInterpolator, RickshawDataTransformer, YAxisUtilities) {
  return {
    restrict: "E",
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      data: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var $el = $(element[0]);

      function redrawGraph() {
        // Graph height is being set irrespective of legend.
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        $el.css('height', graphHeight);
        if (scope.data == null) {
          return;
        }
        var series = RickshawDataTransformer(scope.data);
      }

      function calculateGraphHeight($legend) {
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var height = graphHeight - elementHeight($legend);
        if (height < 1) height = 1;
        return height;
      }

      scope.$watch('graphSettings.expressions', redrawGraph, true);
      scope.$watch('data', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
}]);

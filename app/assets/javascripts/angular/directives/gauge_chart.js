angular.module("Prometheus.directives").directive('gaugeChart',
  ["$location", "$timeout", "WidgetHeightCalculator", "VariableInterpolator", "YAxisUtilities", "ThemeManager",
    function($location, $timeout, WidgetHeightCalculator, VariableInterpolator, YAxisUtilities, ThemeManager) {
  return {
    restrict: "A",
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var $el = $(element[0]);

      function redrawGraph() {
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var graphWidth = $el.width();
        $el.css('height', graphHeight);

        if (!scope.gaugeData || !scope.graphSettings.max) {
          return;
        }

        $el.find('.gauge_chart').empty();

        new Prometheus.Graph.Gauge({
          element: $el.find(".gauge_chart").get(0),
          width: graphWidth,
          height: graphHeight,
          value: scope.gaugeData,
          max: scope.graphSettings.max,
          units: scope.graphSettings.units,
          hideGauge: scope.graphSettings.hideGauge,
          danger: scope.graphSettings.danger/100,
          warning: scope.graphSettings.warning/100,
          precision: scope.graphSettings.precision,
          textColor: ThemeManager.theme === 'light_theme' ? '#111' : '#fff',
        }).render();
      }

      scope.$watch('graphSettings.hideGauge', redrawGraph);
      scope.$watch('graphSettings.legendFormatString', redrawGraph);
      scope.$on('redrawGraphs', function(e, data) {
        if (data) {
          scope.gaugeData = data;
        }
        redrawGraph();
      });
    },
  };
}]);

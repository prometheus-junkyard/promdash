angular.module("Prometheus.directives").directive('pieChart', ["$location", "WidgetHeightCalculator", "VariableInterpolator", "YAxisUtilities", function($location, WidgetHeightCalculator, VariableInterpolator, YAxisUtilities) {
  return {
    restrict: "A",
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      data: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var $el = $(element[0]);
      var tooltip = {};
      var pieGraph;

      function redrawGraph() {
        // Graph height is being set irrespective of legend.
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var graphWidth = $el.width();
        $el.css('height', graphHeight);

        if (pieGraph) {
          $el.html('<div class="graph_chart"></div>');
          pieGraph = null;
        }

        if (scope.data == null) {
          return;
        }

        if (scope.data.Value) {
          tooltip = {};
          scope.data = Array.prototype.slice.call(scope.data.Value);
        }

        scope.data.forEach(function(e) {
          e.value = parseFloat(e.Value);
          delete e.Metric["__name__"];
          tooltip[e.Metric.instance] = e.Metric;
          e.instance = e.Metric.instance;

          if (scope.graphSettings.legendFormatString) {
            e.ts = VariableInterpolator(scope.graphSettings.legendFormatString, e.Metric);
          } else {
            e.ts = properties(e.Metric).join(", ");
          }
        });

        var svg = dimple.newSvg($el.find(".graph_chart")[0], graphWidth, graphHeight);

        pieGraph = new dimple.chart(svg, scope.data);
        pieGraph.addMeasureAxis("p", "value");

        var pies = pieGraph.addSeries(["instance", "ts"], dimple.plot.pie);
        pies.radius = (graphHeight / 2) - 10
        pies.getTooltipText = function(e) {
          var tt = properties(tooltip[e.aggField[0]]);
          tt.push("value: " + e.pValue);
          return tt;
        };

        var showLegend = !(
          scope.graphSettings.legendSetting === "never" ||
            (scope.graphSettings.legendSetting === "sometimes" && scope.data.length > 5)
        );
        if (showLegend) {
          pieGraph.addLegend(10, 15, graphWidth - 20, graphHeight, "left");
        }
        pieGraph.draw();
      }

      function properties(instanceInfo) {
          var tt = [];
          for (var k in instanceInfo) {
            tt.push(k + ": " + instanceInfo[k]);
          }
          return tt;
      }

      scope.$watch('graphSettings.legendSetting', redrawGraph);
      scope.$watch('graphSettings.legendFormatString', redrawGraph);
      scope.$watch('data', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
}]);

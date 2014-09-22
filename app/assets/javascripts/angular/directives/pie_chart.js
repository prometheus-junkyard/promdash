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
        $el.css('height', graphHeight);

        if (pieGraph) {
          $el.html('<div class="graph_chart"></div>');
          pieGraph = null;
        }

        if (scope.data == null) {
          return;
        }

        if (scope.data.Value) {
          scope.data = Array.prototype.slice.call(scope.data.Value);
          scope.data.forEach(function(e) {
            e.Instance = e.Metric.instance;
            e.Value = parseFloat(e.Value);
            tooltip[e.Metric.instance] = e.Metric;
          });
        }

        var svg = dimple.newSvg($el.find(".graph_chart")[0], $el.width(), graphHeight);

        pieGraph = new dimple.chart(svg, scope.data);
        pieGraph.addMeasureAxis("p", "Value");

        var pies = pieGraph.addSeries("Instance", dimple.plot.pie);
        pies.radius = (graphHeight / 2) - 10
        pies.getTooltipText = function (e) {
          var tt = [];
          var instanceInfo = tooltip[e.aggField[0]];
          for (var k in instanceInfo) {
            tt.push(k + ": " + instanceInfo[k]);
          }
          tt.push("value: " + e.pValue);
          return tt;
        };

        pieGraph.addLegend(500, 20, 90, 300, "left");
        pieGraph.draw();
      }

      scope.$watch('graphSettings.expressions', redrawGraph, true);
      scope.$watch('data', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
}]);

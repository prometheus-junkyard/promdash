angular.module("Prometheus.directives").directive('pieChart', ["$location", "WidgetHeightCalculator", "VariableInterpolator", "YAxisUtilities", function($location, WidgetHeightCalculator, VariableInterpolator, YAxisUtilities) {
  return {
    restrict: "A",
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var $el = $(element[0]);
      var pieGraph;
      var pieData = [];

      function redrawGraph() {
        var tooltip = {};
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var graphWidth = $el.width();
        $el.css('height', graphHeight);

        if (pieGraph) {
          $el.html('<div class="graph_chart"></div>');
          pieGraph = null;
        }

        if (!pieData.length) {
          return;
        }

        pieData.forEach(function(e) {
          e.value = parseFloat(e.value[1]);

          if (scope.graphSettings.legendFormatString) {
            e.ts = VariableInterpolator(scope.graphSettings.legendFormatString, e.metric);
          } else {
            var ts = joinProperties(e.metric, "=").map(function(t) {
              return t.replace(/=(.+)/, function($1, $2) {
                return "=\"" + $2 + "\"";
              });
            }).join(",");
            e.ts = (e.metric.__name__ || '') + "{" + ts + "}";
          }
          tooltip[e.ts] = e.metric;
        });

        var svg = dimple.newSvg($el.find(".graph_chart")[0], graphWidth, graphHeight);

        pieGraph = new dimple.chart(svg, pieData);
        pieGraph.addMeasureAxis("p", "value");

        var pies = pieGraph.addSeries("ts", dimple.plot.pie);
        pies.radius = (graphHeight / 2) - 10;
        pies.getTooltipText = function(e) {
          var data = tooltip[e.aggField[0]];
          var tt = [(data.__name__ || 'value') + ": " + e.pValue];
          return tt.concat(joinProperties(data, ": "));
        };

        var showLegend = !(
          scope.graphSettings.showLegend === "never" ||
            (scope.graphSettings.showLegend === "sometimes" && pieData.length > 5)
        );
        if (showLegend) {
          pieGraph.addLegend(10, 15, graphWidth - 20, graphHeight, "left");
        }
        pieGraph.draw();
      }

      function joinProperties(properties, separator) {
          var tooltipText = [];
          for (var k in properties) {
            if (k === "__name__") {
              continue;
            }
            tooltipText.push(k + separator + properties[k]);
          }
          return tooltipText;
      }

      scope.$watch('graphSettings.showLegend', redrawGraph);
      scope.$watch('graphSettings.legendFormatString', redrawGraph);
      scope.$watch('data', redrawGraph, true);
      scope.$on('redrawGraphs', function(e, data) {
        if (data) {
          pieData = data;
        }
        redrawGraph();
      });
    },
  };
}]);

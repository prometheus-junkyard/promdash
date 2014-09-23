angular.module("Prometheus.directives").directive('dimpleGraphChart', ["$location", "WidgetHeightCalculator", "VariableInterpolator", "RickshawDataTransformer", "YAxisUtilities", function($location, WidgetHeightCalculator, VariableInterpolator, RickshawDataTransformer, YAxisUtilities) {
  return {
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      graphData: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var graph = null;
      var $el = $(element[0]);
      var tooltip = {};

      function properties(instanceInfo) {
          var tt = [];
          for (var k in instanceInfo) {
            tt.push(k + ": " + instanceInfo[k]);
          }
          return tt;
      }

      function redrawGraph() {
        // Graph height is being set irrespective of legend.
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var graphWidth = $el.width();
        $el.css('height', graphHeight);

        if (graph) {
          $el.html('<div class="graph_chart"></div>');
          graph = null;
        }

        if (scope.graphData == null) {
          return;
        }

        if (scope.graphData.Value) {
          tooltip = {};
          scope.data = Array.prototype.slice.call(scope.data.Value);
        }

        var data = [];
        scope.graphData.forEach(function(m) {
          m.data.Value.forEach(function(e) {
            delete e.Metric["__name__"];
            tooltip[e.Metric.instance] = e.Metric;
            // for (var i = 0; i < e.Values.length; i += 10) {
            //   e1 = e.Values[i]
            //   e2 = e.Values[i+1]
            //   e3 = e.Values[i+2]
            //   var datum = {};
            //   datum.value = (parseFloat(e1.Value)+
            //     parseFloat(e2.Value)+
            //     parseFloat(e3.Value))/3;
            //   datum.timestamp = (e1.Timestamp+e2.Timestamp+e3.Timestamp)/3
            //   datum.timestamp = (new Date(datum.timestamp * 1000)).toString()
            //   datum.instance = e.Metric.instance;
            //
            //   datum.ts = properties(e.Metric).join(", ");
            //   data.push(datum);
            // }
            e.Values.forEach(function(d) {
              var datum = {};
              datum.value = parseFloat(d.Value);
              datum.timestamp = d.Timestamp;
              datum.instance = e.Metric.instance;

              // if (scope.graphSettings.legendFormatString) {
              //   e.ts = VariableInterpolator(scope.graphSettings.legendFormatString, e.Metric);
              // } else {
              datum.ts = properties(e.Metric).join(", ");
              // }
              data.push(datum);
            });
          });
        });

        var svg = dimple.newSvg($el.find(".graph_chart")[0], graphWidth, graphHeight);

        graph = new dimple.chart(svg, data);
        graph.addCategoryAxis("x", "timestamp");
        graph.addMeasureAxis("y", "value");
        var s = graph.addSeries("ts", dimple.plot.line);
        s.interpolation = "cardinal";
        graph.draw();
      }

      scope.$watch('graphSettings.stacked', redrawGraph);
      scope.$watch('graphSettings.interpolationMethod', redrawGraph);
      scope.$watch('graphSettings.legendSetting', redrawGraph);
      scope.$watch('graphSettings.legendFormatStrings', redrawGraph, true);
      scope.$watch('graphSettings.expressions', redrawGraph, true);
      scope.$watch('graphSettings.axes', redrawGraph, true);
      scope.$watch('graphData', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
}]);

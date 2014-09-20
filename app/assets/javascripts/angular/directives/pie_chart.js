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
          });
        }

        var svg = dimple.newSvg($el.find(".graph_chart")[0], $el.width(), graphHeight);
        svg.append("text")
          .attr("x", $el.width() / 2)
          .attr("y", 20)
          .style("text-anchor", "middle")
          .style("fill", "white")
          .style("font-family", "sans-serif")
          .style("font-weight", "bold")
          .text(scope.data[0].Metric.__name__);
        pieGraph = new dimple.chart(svg, scope.data);
        // pieGraph.setBounds(20, 20, 460, 360)
        pieGraph.addMeasureAxis("p", "Value");
        var pies = pieGraph.addSeries("Instance", dimple.plot.pie);
        pies.radius = (graphHeight / 2) - 10
        pieGraph.addLegend(500, 20, 90, 300, "left");
        pieGraph.draw();
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

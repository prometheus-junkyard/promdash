angular.module("Prometheus.directives").directive('graphChart', ["$location", "WidgetHeightCalculator", "VariableInterpolator", "RickshawDataTransformer", function($location, WidgetHeightCalculator, VariableInterpolator, RickshawDataTransformer) {
  return {
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      graphData: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var rsGraph = null;
      var legend = null;
      var seriesToggle = null;
      function formatTimeSeries(series) {
        series.forEach(function(s) {
          if (!scope.graphSettings.legendFormatString) {
            return;
          }
          s.name = VariableInterpolator(scope.graphSettings.legendFormatString, s.labels);
        });
      }

      function refreshGraph(graph, series) {
        var $el = $(element[0]);
        if (!series.length) {
          $el.empty();
          return;
        }
        graph.series.splice(0, graph.series.length);
        // Remove the onclick handler from each old .action anchor tag, which
        // controls the show/hide action on legend.
        $el.find(".action").each(function() {
          this.onclick = null;
          this.remove();
        });
        $el.find(".legend ul").empty()

        // BUG: If legend items have the same name, they are all assigned the
        // same color after resize.
        // https://github.com/shutterstock/rickshaw/blob/master/src/js/Rickshaw.Series.js#L73
        // The same object is returned each time from itemByName().
        // Our vendored Rickshaw file is edited at comments /*stn*/ to fix
        // this.
        formatTimeSeries(series);
        setLegendPresence(series);

        graph.series.load({items: series});

        // Series toggle is leaking.
        (seriesToggle || {}).legend = null;
        seriesToggle = null;
        seriesToggle = new Rickshaw.Graph.Behavior.Series.Toggle({
          graph: graph,
          legend: legend
        });

        graph.configure({
          renderer: scope.graphSettings.stacked ? 'stack' : 'line',
          interpolation: scope.graphSettings.interpolationMethod,
          height: calculateGraphHeight($el.find(".legend"))
        });

        graph.render();
      }

      function redrawGraph() {
        // Graph height is being set irrespective of legend.
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        $(element[0]).css('height', graphHeight);

        if (scope.graphData == null) {
          return;
        }

        var series = RickshawDataTransformer(scope.graphData, scope.graphSettings.stacked);
        if (rsGraph) {
          refreshGraph(rsGraph, series);
          return;
        }

        if (series.length === 0) {
          return;
        }

        formatTimeSeries(series);
        setLegendPresence(series);

        rsGraph = new Rickshaw.Graph({
          element: element[0],
          interpolation: scope.graphSettings.interpolationMethod,
          renderer: (scope.graphSettings.stacked ? 'stack' : 'line'),
          series: series
        });

        var $legend = $(element[0]).find(".legend");
        legend = createLegend(rsGraph, $legend[0]);

        seriesToggle = new Rickshaw.Graph.Behavior.Series.Toggle({
          graph: rsGraph,
          legend: legend
        });

        // Set legend elements to maximum element width so they line up.
        var $legendElements = $legend.find(".line");
        var widths = $legendElements.map(function(i, el) {
          return el.clientWidth
        });

        var maxWidth = Math.max.apply(Math, widths);
        $legendElements.css("width", maxWidth);

        // TODO: Figure out why mouseleave changes graph elements to same color
        // On legend element mouseleave, all graph elements change to same fill color
        // var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
        //   graph: rsGraph,
        //   legend: legend
        // });

        rsGraph.configure({height: calculateGraphHeight($legend)});
        rsGraph.series.legend = legend;
        rsGraph.render();

        var xAxis = new Rickshaw.Graph.Axis.Time({
          graph: rsGraph
        });
        xAxis.render();

        var yAxis = new Rickshaw.Graph.Axis.Y({
          tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
          graph: rsGraph
        });
        yAxis.render();

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
          graph: rsGraph,
          formatter: function(series, x, y) {
            var date = '<span class="date">' + new Date(x * 1000).toUTCString() + '</span>';
            var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
            var content = swatch + series.labels["name"] + ": <strong>" + y + '</strong>';
            return date + '<br>' + content + '<br>' + renderLabels(series.labels);
          },
          onRender: function() {
            var dot = this.graph.element.querySelector('.dot');
            var hoverContent = this.graph.element.querySelector('.item');

            dot.style.top = parseFloat(dot.style.top) + elementHeight($legend) + "px";
            hoverContent.style.top = parseFloat(hoverContent.style.top) + elementHeight($legend) + "px";
          },
        });
      }

      function elementHeight($element) {
        return $element.outerHeight(true);
      }

      function setLegendPresence(series) {
        $(element[0]).find(".legend").show();
        if (scope.graphSettings.legendSetting === "never" ||
            (scope.graphSettings.legendSetting === "sometimes" && series.length > 5)) {
          $(element[0]).find(".legend").hide();
          series.forEach(function(s) {
            s.noLegend = true;
          });
        }
      }

      function createLegend(graph, element) {
        return new Rickshaw.Graph.Legend({
          graph: graph,
          element: element
        });
      }

      function calculateGraphHeight($legend) {
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        var height = graphHeight - elementHeight($legend);
        if (height < 1) height = 1;
        return height;
      }

      function renderLabels(labels) {
        var labelStrings = [];
        for (label in labels) {
          if (label != "name") {
            labelStrings.push("<strong>" + label + "</strong>: " + labels[label]);
          }
        }
        return labels = "<div class=\"labels\">" + labelStrings.join("<br>") + "</div>";
      }

      scope.$watch('graphSettings.stacked', redrawGraph);
      scope.$watch('graphSettings.interpolationMethod', redrawGraph);
      scope.$watch('graphSettings.legendSetting', redrawGraph);
      scope.$watch('graphSettings.legendFormatString', redrawGraph);
      scope.$watch('graphSettings.axes', redrawGraph, true);
      scope.$watch('graphData', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
}]);

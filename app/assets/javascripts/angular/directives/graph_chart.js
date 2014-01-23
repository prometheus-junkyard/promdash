angular.module("Prometheus.directives").directive('graphChart', function(WidgetHeightCalculator, VariableInterpolator) {
  return {
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      graphData: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var rsGraph = null;
      function metricToTsName(labels) {
        var tsName = labels["name"] + "{";
        var labelStrings = [];
         for (label in labels) {
           if (label != "name") {
            labelStrings.push(label + "=\"" + labels[label] + "\"");
           }
         }
        tsName += labelStrings.join(",") + "}";
        return tsName;
      }

      function parseValue(value) {
        if (value == "NaN" || value == "Inf" || value == "-Inf") {
          return 0; // TODO: what should we really do here?
        } else {
          return parseFloat(value);
        }
      }

      function transformData(data) {
        var palette = new Rickshaw.Color.Palette();
        var series = [];
        for (var i = 0; i < data.length; i++) {
          if (!data[i]) {
            continue;
          }

          series = series.concat(data[i]['data'].Value.map(function(ts) {
            return {
              name: metricToTsName(ts.Metric),
              labels: ts.Metric,
              data: ts.Values.map(function(value) {
                return {
                  x: value.Timestamp,
                  y: parseValue(value.Value)
                }
              }),
              color: palette.color()
            };
          }));
        }
        if (scope.graphSettings.stacked) {
          Rickshaw.Series.zeroFill(series);
        }
        return series;
      }

      function formatTimeSeries(series) {
        var re = /{{\w+}}/g;
        series.forEach(function(s) {
          if (!scope.graphSettings.legendFormatString) {
            return;
          }
          s.name = VariableInterpolator(scope.graphSettings.legendFormatString, s.labels);
        });
      }

      function redrawGraph() {
        // graph height is being set irrespective of legend
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        $(element[0]).css('height', graphHeight);

        if (scope.graphData == null) {
          return;
        }

        var series = transformData(scope.graphData);
        if (series.length === 0) {
          return;
        }

        if (rsGraph != null) {
          element[0].innerHTML = '<div class="legend"></div>';
        }
        var $legend = $(element[0]).find(".legend");

        formatTimeSeries(series);

        rsGraph = new Rickshaw.Graph({
          element: element[0],
          renderer: (scope.graphSettings.stacked ? 'stack' : 'line'),
          series: series
        });

        if (scope.graphSettings.legendSetting === "always" ||
            (scope.graphSettings.legendSetting === "sometimes" && series.length < 6)) {
          var legend = new Rickshaw.Graph.Legend({
            graph: rsGraph,
            element: $legend[0]
          });

          new Rickshaw.Graph.Behavior.Series.Toggle({
            graph: rsGraph,
            legend: legend
          });

          // set legend elements to maximum element width so they line up
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

          var height = graphHeight - elementHeight($legend);
          if (height < 1) height = 1;
          rsGraph.configure({height: height});
        }

        rsGraph.render();

        var xAxis = new Rickshaw.Graph.Axis.Time({
            graph: rsGraph
        });
        xAxis.render();

        var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: rsGraph
        });
        yAxis.render();

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
          graph: rsGraph,
          formatter: function(series, x, y) {
            var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
            var content = swatch + series.labels["name"] + ": <strong>" + y + '</strong><br>';
            return content + renderLabels(series.labels);
          },
          onRender: function() {
            var dot = this.graph.element.querySelector('.dot');
            var hoverContent = this.graph.element.querySelector('.item');
            var width = this.graph.width;
            var element = $(this.element);

            dot.style.top = parseFloat(dot.style.top) + elementHeight($legend) + "px";
            hoverContent.style.top = parseFloat(hoverContent.style.top) + elementHeight($legend) + "px";

            $(".x_label", element).each(function() {
              if ($(this).outerWidth() + element.offset().left > width) {
                $(this).addClass("flipped");
              } else {
                $(this).removeClass("flipped");
              }
            })

            $(".item", element).each(function() {
              if ($(this).outerWidth() + element.offset().left > width) {
                $(this).addClass("flipped");
              } else {
                $(this).removeClass("flipped");
              }
            })
          },
        });
      }

      function elementHeight($element) {
        return $element.get(0).clientHeight;
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
      scope.$watch('graphSettings.legendSetting', redrawGraph);
      scope.$watch('graphSettings.legendFormatString', redrawGraph);
      scope.$watch('graphSettings.axes', redrawGraph, true);
      scope.$watch('graphData', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
});

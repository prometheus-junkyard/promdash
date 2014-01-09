angular.module("Prometheus.directives").directive('graphChart', function(WidgetHeightCalculator) {
  return {
    scope: {
      graphSettings: '=',
      globalConfig: '=',
      graphData: '='
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

      function redrawGraph() {
        $(element[0]).css('height', WidgetHeightCalculator(element[0], scope.globalConfig.aspectRatio));

        if (scope.graphData == null) {
          return;
        }

        var series = transformData(scope.graphData);
        if (series.length === 0) {
          return;
        }

        if (rsGraph != null) {
          element[0].innerHTML = '';
        }

        rsGraph = new Rickshaw.Graph({
          element: element[0],
          renderer: (scope.graphSettings.stacked ? 'stack' : 'line'),
          series: series
        });

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
            var width = this.graph.width;
            var element = $(this.element);

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
      scope.$watch('graphSettings.axes', redrawGraph, true);
      scope.$watch('graphData', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
});



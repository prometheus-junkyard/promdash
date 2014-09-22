angular.module("Prometheus.directives").directive('graphChart', ["$location", "WidgetHeightCalculator", "VariableInterpolator", "RickshawDataTransformer", "YAxisUtilities", function($location, WidgetHeightCalculator, VariableInterpolator, RickshawDataTransformer, YAxisUtilities) {
  return {
    scope: {
      graphSettings: '=',
      aspectRatio: '=',
      graphData: '=',
      vars: '='
    },
    link: function(scope, element, attrs) {
      var rsGraph = null;
      var $el = $(element[0]);

      function setLegendString(series) {
        // TODO(stuartnelson3): Do something with this function. Put it somewhere or simplify it.
        var expressions = scope.graphSettings.expressions;
        expressions.forEach(function(exp) {
          series.forEach(function(s) {
            if (s.exp_id === exp.id) {
              var lst = scope.graphSettings.legendFormatStrings.filter(function(lst) {
                return lst.id === exp.legend_id;
              })[0];
              if (!(lst || {}).name) {
                return;
              }
              s.name = VariableInterpolator(lst.name, s.labels);
            }
          });
        });
      }

      function redrawGraph() {
        // Graph height is being set irrespective of legend.
        var graphHeight = WidgetHeightCalculator(element[0], scope.aspectRatio);
        $el.css('height', graphHeight);

        if (rsGraph) {
          $el.html('<div class="graph_chart"><div class="legend"></div></div>');
          rsGraph = null;
        }
        var graphEl = $el.find('.graph_chart').get(0);

        if (scope.graphData == null) {
          return;
        }

        var series = RickshawDataTransformer(scope.graphData);

        var seriesYLimitFn = calculateBound(series);
        var yMinForLog = seriesYLimitFn(Math.min);
        var yMin = yMinForLog > 0 ? 0 : yMinForLog;
        var yMax = seriesYLimitFn(Math.max);

        var yMinForGraph = yMin;
        // The range on the y-axis is way too large if both yMin and yMax are
        // negative. Setting yMin to 0 fixes this.
        if (yMinForLog > 0) {
          yMinForGraph = 0;
        } else if (yMin < 0 && yMax < 0) {
          yMinForGraph = 0;
        }

        // Set scale in yScales based on max/min of all series on that axis.
        var axesBounds = {};

        var a1series = series.filter(function(s) {
          return s.axis_id === 1;
        });
        var a1LimitFn = calculateBound(a1series);
        axesBounds[1] = {
          max: a1LimitFn(Math.max),
          min: a1LimitFn(Math.min),
        };

        var a2series = series.filter(function(s) {
          return s.axis_id === 2;
        });
        var a2LimitFn = calculateBound(a2series);
        axesBounds[2] = {
          max: a2LimitFn(Math.max),
          min: a2LimitFn(Math.min),
        };

        var yScales = {};
        var scaleId;
        var graphMax;
        series.forEach(function(s) {
          var axes = scope.graphSettings.axes;
          var matchingAxis = axes.filter(function(a) {
            return a.id === s.axis_id;
          })[0] || axes[0];

          var bound = axesBounds[matchingAxis.id];
          var min = bound.min > 0 ? 0 : bound.min;

          var maxSplit = (matchingAxis.yMax || "").split("=");
          var maybeCond = maxSplit[0];

          var enteredYMin = parseFloat(matchingAxis.yMin, 10);
          var maybeYMax = parseFloat(maybeCond, 10);
          if (isNaN(maybeYMax) && maxSplit[1]) {
            maybeYMax = parseFloat(maxSplit[1], 10);
            switch (maybeCond) {
              case ">":
                if (axesBounds[matchingAxis.id].max > maybeYMax) {
                  graphMax = axesBounds[matchingAxis.id].max;
                  bound.max = axesBounds[matchingAxis.id].max;
                } else {
                  bound.max = maybeYMax;
                  graphMax = maybeYMax;
                }
                scaleId = s.axis_id;
                break;
              case "<":
                if (axesBounds[matchingAxis.id].max < maybeYMax) {
                  graphMax = axesBounds[matchingAxis.id].max;
                  bound.max = axesBounds[matchingAxis.id].max;
                } else {
                  bound.max = maybeYMax;
                  graphMax = maybeYMax;
                }
                scaleId = s.axis_id;
                break;
              default:
                // Do nothing.
            }
          } else if (!isNaN(maybeYMax)) {
            bound.max = maybeYMax;
            graphMax = maybeYMax;
            scaleId = s.axis_id;
          }
          if (!isNaN(enteredYMin)) {
            // min is used for the linear scale; all numbers are acceptable.
            min = matchingAxis.yMin;

            // bound.min is used for the logarithmic scale; 0 and numbers of
            // opposite sign are not acceptable.
            bound.min = (enteredYMin * bound.min) > 0 ? enteredYMin : bound.min;
          }

          // If the min and max are equal for a logarithmic scale, the series
          // data value ends up being placed at 0 instead of 1.
          if (bound.min === bound.max) {
            bound.min = bound.min - 0.01;
          }
          YAxisUtilities.setLogScale(bound.min, bound.max);
          YAxisUtilities.setLinearScale(min, bound.max);

          s.scale = YAxisUtilities.getScale(matchingAxis.scale);
          yScales[s.axis_id] = s.scale;
          delete s.axis_id;

          if (matchingAxis.renderer) {
            s.renderer = matchingAxis.renderer;
          }
        });

        // Insert (x, null) pair at any discontinuity in the data.
        // Rickshaw.Series.zeroFill breaks logarithmic graphs.
        Rickshaw.Series.fill(series, null);

        // If all series are removed from a certain axis but a scale has been
        // assigned to that axis, it will render with the wrong range.
        if (!a1series.length) {
          yScales[1] = yScales[2];
        }
        if (!a2series.length) {
          yScales[2] = yScales[1];
        }

        if (series.length === 0) {
          return;
        }

        setLegendString(series);
        setLegendPresence(series);

        rsGraph = new Rickshaw.Graph({
          element: graphEl,
          renderer: 'multi',
          min: yMinForGraph,
          interpolation: scope.graphSettings.interpolationMethod,
          series: series
        });

        if (scaleId) {
          rsGraph.max = yScales[scaleId](graphMax);
        } else {
          rsGraph.max = rsGraph.renderer.domain().y[1];
        }

        var $legend = $el.find(".legend");
        var legend = createLegend(rsGraph, $legend[0]);

        var seriesToggle = new Rickshaw.Graph.Behavior.Series.Toggle({
          graph: rsGraph,
          legend: legend
        });

        // Set legend elements to maximum element width so they line up.
        var $legendElements = $legend.find(".line");
        var widths = $legendElements.map(function(i, el) {
          return el.clientWidth;
        });

        var maxWidth = Math.max.apply(Math, widths);
        $legendElements.css("width", maxWidth);

        // TODO: Figure out why mouseleave changes graph elements to same color
        // On legend element mouseleave, all graph elements change to same fill color
        // var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
        //   graph: rsGraph,
        //   legend: legend
        // });

        rsGraph.configure({
          dotSize: 2,
          height: calculateGraphHeight($legend)
        });
        rsGraph.series.legend = legend;
        rsGraph.render();

        var xAxis = new Rickshaw.Graph.Axis.Time({
          graph: rsGraph
        });
        xAxis.render();

        var leftAxisSettings = scope.graphSettings.axes[0];
        var rightAxisSettings = scope.graphSettings.axes[1];

        var yAxisLeft = {
          graph: rsGraph,
          orientation: 'right',
          tickFormat: YAxisUtilities.getTickFormat(leftAxisSettings.format),
          scale: yScales[1] || yScales[2]
        };
        var yAxis = createYAxis(yAxisLeft);
        yAxis.render();

        if (rightAxisSettings && yScales[2]) {
          var scale = yScales[2];
          var tickFormat = YAxisUtilities.getTickFormat(rightAxisSettings.format);
          var yAxis2 = createYAxis2(rsGraph, tickFormat, scale);
          yAxis2.render();
        }

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
          graph: rsGraph,
          formatter: function(series, x, y) {
            var date = '<span class="date">' + new Date(x * 1000).toUTCString() + '</span>';
            var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
            var content = swatch + series.labels["__name__"] + ": <strong>" + y + '</strong>';
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

      function createYAxis2(graph, tickFormat, scale) {
        var yAxisRight = {
          graph: graph,
          orientation: 'left',
          tickFormat: tickFormat,
          scale: scale
        };
        var yAxis2 = createYAxis(yAxisRight);
        yAxis2.height = graph.height;
        yAxis2.width = graph.width;
        yAxis2.berthRate = 0;
        return yAxis2;
      }

      function createYAxis(config) {
        return new Rickshaw.Graph.Axis.Y.Scaled(config);
      }

      function elementHeight($element) {
        return $element.outerHeight(true);
      }

      function calculateBound(series) {
        var yValues = series.map(function(s) {
          return s.data.map(function(d) {
            return d.y;
          });
        });
        var flatYValues = d3.merge(yValues);
        return function(bound) {
          var limit = bound.apply(Math, flatYValues);
          return limit;
        }
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
        var labelRows = [];
        for (label in labels) {
          if (label != "__name__") {
            labelRows.push("<tr><th>" + label + "</th><td>" + labels[label] + "</td></tr>");
          }
        }
        return "<table class=\"labels_table\">" + labelRows.join("") + "</table>";
      }


      // Only $watch for changes on the expression.legend_id and
      // legendFormatString.name. This replaces a deep watch on
      // graphSettings.expressions that caused poor performance.
      scope.$watch(function(scope) {
        return scope.graphSettings.expressions.map(function(expr) {
          return expr.legend_id;
        });
      }, redrawGraph, true);
      scope.$watch(function(scope) {
        return scope.graphSettings.legendFormatStrings.map(function(legendObj) {
          return legendObj.name;
        });
      }, redrawGraph, true);

      scope.$watch('graphSettings.stacked', redrawGraph);
      scope.$watch('graphSettings.interpolationMethod', redrawGraph);
      scope.$watch('graphSettings.legendSetting', redrawGraph);
      scope.$watch('graphSettings.axes', redrawGraph, true);
      scope.$watch('graphData', redrawGraph, true);
      scope.$on('redrawGraphs', function() {
        redrawGraph();
      });
    },
  };
}]);

var Prometheus = Prometheus || {};

Prometheus.Graph = {
  rangeSteps: [
    '1s', '10s', '1m', '5m', '15m', '30m', '1h', '2h', '6h', '12h', '1d', '2d',
    '1w', '2w', '4w', '8w', '1y', '2y'
  ],

  timeFactors: {
    'y': 60 * 60 * 24 * 365,
    'w': 60 * 60 * 24 * 7,
    'd': 60 * 60 * 24,
    'h': 60 * 60,
    'm': 60,
    's': 1
  },

  parseDuration: function(durationText) {
    if (!durationText) {
      return 60;
    }
    var rangeRE = new RegExp('^([0-9]+)([ywdhms]+)$');
    var matches = durationText.match(rangeRE);
    if (!matches) { return };
    if (matches.length != 3) {
      return 60;
    }
    var value = parseInt(matches[1]);
    var unit = matches[2];
    return value * Prometheus.Graph.timeFactors[unit];
  },

  nextLongerRange: function(currentRange) {
    if (!currentRange) {
      return '1h';
    }
    var rangeSeconds = Prometheus.Graph.parseDuration(currentRange);
    for (var i = 0; i < Prometheus.Graph.rangeSteps.length; i++) {
      if (rangeSeconds < Prometheus.Graph.parseDuration(Prometheus.Graph.rangeSteps[i])) {
        return Prometheus.Graph.rangeSteps[i];
      }
    }
    return currentRange;
  },

  nextShorterRange: function(currentRange) {
    if (!currentRange) {
      return '1h';
    }
    var rangeSeconds = Prometheus.Graph.parseDuration(currentRange);
    for (var i = Prometheus.Graph.rangeSteps.length - 1; i >= 0; i--) {
      if (rangeSeconds > Prometheus.Graph.parseDuration(Prometheus.Graph.rangeSteps[i])) {
        return Prometheus.Graph.rangeSteps[i];
      }
    }
    return currentRange;
  },

  earlierEndTime: function(timestamp, rangeText) {
    var range = Prometheus.Graph.parseDuration(rangeText);
    var date = timestamp ? new Date(timestamp) : new Date();
    return Math.floor(date.getTime() - (range * 1000 / 2));
  },

  laterEndTime: function(timestamp, rangeText) {
    var range = Prometheus.Graph.parseDuration(rangeText);
    var date = timestamp ? new Date(timestamp) : new Date();
    return Math.floor(date.getTime() + (range * 1000 / 2));
  },

  getGraphDefaults: function() {
    return {
      title: 'Title',
      stacked: false,
      range: '1h',
      endTime: 0,
      expressions: []
    };
  },

  getAxisDefaults: function() {
    return {
      orientation: 'left',
      scale: 'linear',
      format: 'kmbt'
    };
  }
};

Prometheus.Angular = Prometheus.Angular || {};
Prometheus.Angular.Dashboard = angular.module('dashboard', []);

Prometheus.Angular.Dashboard.controller('DashboardCtrl', function($scope, $http, $timeout, $document) {
  $scope.globalConfig = dashboardData.globalConfig || {
    numColumns: 2,
    endTime: null
  };
  $scope.graphs = dashboardData.graphs || [];
  $scope.servers = servers;
  $scope.fullscreen = false;
  $scope.saving = false;
  $scope.showGridSettings = false;

  $http.get('/servers.json')
    .success(function(data, status) {
      $scope.servers = data;
    })
    .error(function(data, status) {
      alert('Error fetching list of configured servers.');
    });

  $scope.$watch('servers', function() {
    $scope.serversById = {};
    for (var i = 0; i < $scope.servers.length; i++) {
      $scope.serversById[$scope.servers[i].id] = $scope.servers[i];
    }
  });

  $scope.saveDashboard = function() {
    $scope.saving = true;
    $http.put(window.location.pathname + '.json', {
      'dashboard': {
        'graphs_json': angular.toJson({
          'globalConfig': $scope.globalConfig,
          'graphs': $scope.graphs
        })
      }
    }).error(function(data, status) {
      alert("Error saving dashboard.");
    }).always(function() {
      $scope.saving = false;
    });
  }

  $scope.increaseRange = function() {
    $scope.globalConfig.range = Prometheus.Graph.nextLongerRange($scope.globalConfig.range);
    $scope.$broadcast('setRange', $scope.globalConfig.range);
  };

  $scope.decreaseRange = function() {
    $scope.globalConfig.range = Prometheus.Graph.nextShorterRange($scope.globalConfig.range);
    $scope.$broadcast('setRange', $scope.globalConfig.range);
  };

  $scope.increaseEndTime = function() {
    $scope.globalConfig.endTime = Prometheus.Graph.laterEndTime($scope.globalConfig.endTime, $scope.globalConfig.range);
  };

  $scope.decreaseEndTime = function() {
    $scope.globalConfig.endTime = Prometheus.Graph.earlierEndTime($scope.globalConfig.endTime, $scope.globalConfig.range);
  };

  $scope.refreshGraphs = function() {
    $scope.$broadcast('refreshGraphs');
  };

  $scope.redrawGraphs = function() {
    $scope.$broadcast('redrawGraphs');
  };

  $scope.enableFullscreen = function() {
    $scope.fullscreen = true;
    // Needs to be wrapped in a $timeout because otherwise the broadcast
    // happens before the graph size change.
    $timeout(function() {$scope.redrawGraphs();}, 0);
  };

  $document.keydown(function(ev) {
    if (ev.keyCode == 27) { // Escape keycode.
      $scope.fullscreen = false;
      // Needs to be wrapped in a $timeout because otherwise the broadcast
      // happens before the graph size change. 100ms timeout seems to work most
      // of the time. Still this is an UGLY HACK that doesn't even always work
      // and a better solution is welcome.
      $timeout(function() {$scope.redrawGraphs();}, 100);
    }
  });

  $scope.toggleGridSettings = function(tab) {
    $scope.showGridSettings
    if ($scope.showGridSettings == tab) {
      $scope.showTab = null;
    } else {
      $scope.showTab = tab;
    }
  };

  $scope.$watch('globalConfig.numColumns', function() {
    $scope.$broadcast('redrawGraphs');
  });

  $scope.$watch('globalConfig.graphHeight', function() {
    $scope.$broadcast('redrawGraphs');
  });

  $scope.columnClass = function() {
    var colMap = {
      1: 12,
      2: 6,
      3: 4,
      4: 3,
      5: 2,
      6: 1
    };
    return 'col-lg-' + colMap[$scope.globalConfig.numColumns];
  };

  $scope.addGraph = function() {
    $scope.graphs.push(Prometheus.Graph.getGraphDefaults());
  };

  function setupRefreshTimer(delay) {
    $scope.refreshTimer = $timeout(function() {
      $scope.$broadcast('refreshGraphs');
      setupRefreshTimer(delay);
    }, delay * 1000);
  }

  $scope.$watch('globalConfig.refresh', function() {
    if ($scope.refreshTimer) {
      $timeout.cancel($scope.refreshTimer);
    }
    if ($scope.globalConfig.refresh) {
      setupRefreshTimer(Prometheus.Graph.parseDuration($scope.globalConfig.refresh));
    }
  });

  if ($scope.graphs.length == 0) {
    $scope.addGraph();
  }
});

Prometheus.Angular.Dashboard.controller('GraphCtrl', function($scope, $http) {
  $scope.graph.axes = [];
  $scope.requestsInFlight = 0;
  $scope.data = null;

  $scope.removeGraph = function(idx) {
    $scope.graphs.splice(idx, 1);
  };

  $scope.toggleTab = function(tab) {
    if ($scope.showTab == tab) {
      $scope.showTab = null;
    } else {
      $scope.showTab = tab;
    }
  };

  $scope.addExpression = function() {
    var serverId = 0;
    var axisId = 0;
    if ($scope.graph.expressions.length != 0) {
      var prev = $scope.graph.expressions[$scope.graph.expressions.length-1];
      serverId = prev['server_id'];
      axisId = prev['axis_id'];
    } else if ($scope.servers.length != 0) {
      serverId = $scope.servers[0]['id'];
      axisId = $scope.graph.axes[0]['id'];
    }

    $scope.graph.expressions.push({
      'server_id': serverId,
      'axis_id': axisId,
      'expression': ''
    });
  };

  $scope.removeExpression = function(idx) {
    $scope.graph.expressions.splice(idx, 1);
  };

  $scope.increaseRange = function() {
    $scope.graph.range = Prometheus.Graph.nextLongerRange($scope.graph.range);
  };

  $scope.decreaseRange = function() {
    $scope.graph.range = Prometheus.Graph.nextShorterRange($scope.graph.range);
  };

  $scope.increaseEndTime = function() {
    $scope.graph.endTime = Prometheus.Graph.laterEndTime($scope.graph.endTime, $scope.graph.range);
  };

  $scope.decreaseEndTime = function() {
    $scope.graph.endTime = Prometheus.Graph.earlierEndTime($scope.graph.endTime, $scope.graph.range);
  };

  $scope.addAxis = function() {
    var len = $scope.graph.axes.push(Prometheus.Graph.getAxisDefaults());
    $scope.graph.axes[len-1]['id'] = len;
  };

  $scope.removeAxis = function(idx) {
    var len = $scope.graph.axes.length;
    if (len == 1) {
      alert('Cannot remove last axis');
      return;
    }

    $scope.graph.axes.splice(idx, 1);
    for (var i = 0; i < len-1; i++) {
      $scope.graph.axes[i]['id'] = i + 1;
    }
  };

  $scope.$on('setRange', function(ev, range) {
    $scope.graph.range = range;
    $scope.refreshGraph();
  });

  // TODO: Remove this parent dependency by making a graph a directive instead.
  $scope.$watch('globalConfig.endTime', function() {
    $scope.graph.endTime = $scope.globalConfig.endTime;
    $scope.refreshGraph();
  });

  $scope.$on('refreshGraphs', function(ev) {
    $scope.refreshGraph();
  });

  $scope.refreshGraph = function() {
    // Collect data for all expressions in this array.
    var allData = [];

    function requestFinished() {
      $scope.requestsInFlight--;
      $scope.data = allData;
    };

    function loadGraphData(expression, server, axisId) {
      $scope.requestsInFlight++;
      var rangeSeconds = Prometheus.Graph.parseDuration($scope.graph.range);
      $http.get(server.url + 'api/query_range', {
        params: {
          expr: expression,
          range: rangeSeconds,
          end: Math.floor($scope.graph.endTime / 1000),
          step: Math.max(Math.floor(rangeSeconds / 250))
        },
        cache: false
      }).success(function(data, status) {
        switch(data.Type) {
        case 'error':
          console.log('Error evaluating expression "' + expression + '" on server ' + server.url + ': ' + data.Value);
          break;
        case 'matrix':
          allData.push({
            'axis_id': axisId,
            'data': data
          });
          break;
        default:
          console.log('Result for expression "' + expression + '" is not of matrix type! Skipping.');
        }
      }).error(function(data, status, b) {
        console.log('Error querying server ' + server.url + ' for expression "' + expression + '"');
      }).always(function() {
        requestFinished();
      });
    }

    for (var i = 0; i < $scope.graph.expressions.length; i++) {
      var exp = $scope.graph.expressions[i];
      var server = $scope.serversById[exp['server_id']];
      if (server == undefined) {
        console.log('No server selected for expression, skipping.');
        continue;
      }
      var axisId = exp['axis_id'];

      var expression = $scope.graph.expressions[i].expression;

      loadGraphData(expression, server, axisId);
    }
  };

  if ($scope.graph.axes.length == 0) {
    $scope.addAxis();
  }

  $scope.refreshGraph();
});

Prometheus.Angular.Dashboard.directive('graphChart', function() {
  return {
    scope: {
      graphSettings: '=',
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
        if (scope.graphData == null) {
          return;
        }
        if (rsGraph != null) {
          element[0].innerHTML = '';
        }

        var series = transformData(scope.graphData);
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
      scope.$on('redrawGraphs', redrawGraph);
    },
  };
});

Prometheus.Angular.Dashboard.directive('datetimePicker', function() {
  return {
    scope: {
      // The date/time in milliseconds since the Epoch. null when unset.
      datetime: '=',
    },
    link: function(scope, element, attrs) {
      var picker = $(element[0]).datetimepicker({
        language: 'en',
        pickSeconds: false
      });

      picker.on('changeDate', function(e) {
        scope.$apply(function() {
          var date = picker.data('datetimepicker').getDate();
          if (date == null) {
            scope.datetime = null;
          } else {
            scope.datetime = date.getTime();
          }
        });
      });

      scope.$watch('datetime', function() {
        var date = null;
        if (scope.datetime != null) {
          date = new Date(scope.datetime);
        }
        picker.data('datetimepicker').setValue(date);
      });
    }
  };
});

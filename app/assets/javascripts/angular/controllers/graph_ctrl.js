angular.module("Prometheus.controllers").controller('GraphCtrl',
                                                    ["$scope",
                                                      "$http",
                                                      "$timeout",
                                                      "GraphRefresher",
                                                      "YAxisUtilities",
                                                      "SharedWidgetSetup",
                                                      "Palettes",
                                                      "AnnotationRefresher",
                                                      function($scope,
                                                               $http,
                                                               $timeout,
                                                               GraphRefresher,
                                                               YAxisUtilities,
                                                               SharedWidgetSetup,
                                                               Palettes,
                                                               AnnotationRefresher) {
  SharedWidgetSetup($scope);

  // TODO: Set these on graph creation so we don't have to keep doing these
  // checks
  $scope.graph.interpolationMethod = $scope.graph.interpolationMethod || "linear";
  $scope.graph.disabledSeries = $scope.graph.disabledSeries || {};
  $scope.graph.axes = $scope.graph.axes || [];
  $scope.graph.resolution = $scope.graph.resolution || 4;
  $scope.graph.axes.forEach(function(axis) {
    axis.renderer = axis.renderer || "line";
  });

  $scope.requestsInFlight = 0;
  $scope.palettes = Palettes;

  $scope.addAxis = function() {
    var len = $scope.graph.axes.push(Prometheus.Graph.getAxisDefaults());
    $scope.graph.axes[len-1].id = len;
  };

  $scope.removeAxis = function(idx) {
    var axes = $scope.graph.axes;
    var len = axes.length;

    $scope.graph.expressions.forEach(function(expr) {
      if (expr.axisID === axes[idx].id) {
        expr.axisID = axes[0].id;
      }
    });

    axes.splice(idx, 1);
    for (var i = 0; i < len-1; i++) {
      axes[i].id = i + 1;
    }
    $scope.refreshGraph();
  };

  $scope.$on('setPalette', function(ev, palette) {
    $scope.graph.palette = palette;
    $scope.refreshGraph();
  });

  $scope.$on('setResolution', function(ev, resolution) {
    $scope.graph.resolution = resolution;
    $scope.refreshGraph();
  });

  $scope.$on('setRange', function(ev, range) {
    $scope.graph.range = range;
    $scope.refreshGraph(500);
  });

  $scope.$on('setEndTime', function(ev, endTime) {
    $scope.graph.endTime = endTime;
    $scope.refreshGraph(500);
  });

  $scope.$on('changeExpression', function(ev) {
    $scope.refreshGraph();
  });

  $scope.disableYMaxSibling = YAxisUtilities.disableYMaxSibling;
  $scope.checkValidNumber = YAxisUtilities.checkValidNumber;

  var debounce;
  $scope.refreshGraph = function(scope) {
    var refreshFn = GraphRefresher(scope);
    return function(timeout) {
      var r = $scope.graph.resolution;
      if (r === 1) {
        r = 0.5;
      }
      var scalingFactor = $(".widget_wrapper").outerWidth() * r / 10;
      // bigger denominator == smaller step == more data
      var step = Math.floor(Prometheus.Graph.parseDuration($scope.graph.range)/scalingFactor);
      // Cancels the reload request if it exists.
      $timeout.cancel(debounce);
      debounce = $timeout(function() {
        refreshFn('/api/query_range', {
          end: $scope.graph.endTime,
          range: $scope.graph.range,
          step: step < 5 ? 5 : step,
        }).then(function(data) {
          scope.$broadcast('redrawGraphs', data);
          AnnotationRefresher(scope.graph, scope);
        });
      }, timeout);
    };
  }($scope);

  if ($scope.graph.axes.length === 0) {
    $scope.addAxis();
  }

  $scope.$watch('graph.range', function() {
    $scope.refreshGraph();
  });
  $scope.$watch('graph.endTime', function() {
    $scope.refreshGraph();
  });
  $scope.$watch('graph.resolution', function() {
    $scope.refreshGraph();
  });

  $scope.refreshGraph();

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

angular.module("Prometheus.controllers").controller('GraphCtrl',
                                                    ["$scope",
                                                      "GraphRefresher",
                                                      "YAxisUtilities",
                                                      "SharedWidgetSetup",
                                                      "Palettes",
                                                      function($scope,
                                                               GraphRefresher,
                                                               YAxisUtilities,
                                                               SharedWidgetSetup,
                                                               Palettes) {
  SharedWidgetSetup($scope);

  // TODO: Set these on graph creation so we don't have to keep doing these
  // checks
  $scope.graph.legendFormatStrings = $scope.graph.legendFormatStrings || [
    {id: 1, name: ""}
  ];
  $scope.graph.interpolationMethod = $scope.graph.interpolationMethod || "cardinal";
  $scope.graph.axes = $scope.graph.axes || [];
  $scope.graph.axes.forEach(function(axis) {
    axis.renderer = axis.renderer || "line";
  });

  $scope.requestsInFlight = 0;
  $scope.palettes = Palettes;

  $scope.addExpression = function() {
    var serverId = 0;
    var axisId = 0;
    var id = 0;
    if ($scope.graph.expressions.length != 0) {
      var prev = $scope.graph.expressions[$scope.graph.expressions.length-1];
      id = prev['id'] + 1;
      serverId = prev['server_id'];
      axisId = prev['axis_id'];
    } else if ($scope.servers.length != 0) {
      serverId = $scope.servers[0]['id'];
      axisId = $scope.graph.axes[0]['id'];
    }

    var exp = {
      'id': id,
      'server_id': serverId,
      'axis_id': axisId,
      'expression': ''
    };
    $scope.graph.expressions.push(exp);
  };

  $scope.$on('removeExpression', function(ev, index) {
    $scope.graph.expressions.splice(index, 1);
  });

  $scope.addAxis = function() {
    var len = $scope.graph.axes.push(Prometheus.Graph.getAxisDefaults());
    $scope.graph.axes[len-1]['id'] = len;
  };

  $scope.removeAxis = function(idx) {
    var axes = $scope.graph.axes;
    var len = axes.length;

    $scope.graph.expressions.forEach(function(expr) {
      if (expr.axis_id === axes[idx].id) {
        expr.axis_id = axes[0].id
      }
    });

    axes.splice(idx, 1);
    for (var i = 0; i < len-1; i++) {
      axes[i]['id'] = i + 1;
    }
    $scope.refreshGraph();
  };

  $scope.$on('setPalette', function(ev, palette) {
    $scope.graph.palette = palette;
    $scope.refreshGraph();
  });

  $scope.$on('setRange', function(ev, range) {
    $scope.graph.range = range;
    $scope.refreshGraph();
  });

  $scope.$on('setEndTime', function(ev, endTime) {
    $scope.graph.endTime = endTime;
    $scope.refreshGraph();
  });

  $scope.addLegendString = function() {
    var lsts = $scope.graph.legendFormatStrings;
    var id = (new Date).getTime().toString(16);
    lsts.push({id: id, name: ""});
  };

  $scope.removeLegendString = function(index) {
    $scope.graph.legendFormatStrings.splice(index, 1);
  };

  $scope.disableYMaxSibling = YAxisUtilities.disableYMaxSibling;
  $scope.checkValidNumber = YAxisUtilities.checkValidNumber;

  $scope.refreshGraph = function(scope) {
    var refreshFn = GraphRefresher(scope);
    return function() {
      refreshFn().then(function(data) {
        $scope.$broadcast('redrawGraphs', data);
      });
    };
  }($scope);

  if ($scope.graph.axes.length == 0) {
    $scope.addAxis();
  }

  $scope.refreshGraph();
  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

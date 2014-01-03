angular.module("Prometheus.controllers").controller('GraphCtrl', ["$scope", "$http", "$window", function($scope, $http, $window) {
  $scope.serversById = {};
  for (var i = 0; i < $scope.servers.length; i++) {
    $scope.serversById[$scope.servers[i].id] = $scope.servers[i];
  }

  $window.onresize = function() {
    $scope.$broadcast('redrawGraphs');
  }

  $scope.graph.axes = [];
  $scope.requestsInFlight = 0;
  $scope.data = null;

  $scope.removeGraph = function() {
    $scope.$emit('removeWidget', $scope.index);
  };

  $scope.toggleTab = function(tab) {
    $scope.showTab = $scope.showTab == tab ? null : tab;
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

  $scope.$watch('globalEndTime', function() {
    $scope.graph.endTime = $scope.globalEndTime;
    $scope.refreshGraph();
  });

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshGraph();
  });

  // TODO: Put this into a separate service.
  $scope.refreshGraph = function() {
    // Collect data for all expressions in this array.
    var allData = [];

    function requestFinished() {
      $scope.requestsInFlight--;
      $scope.data = allData;
    };

    function loadGraphData(idx, expression, server, axisId) {
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
          allData[idx] = {
            'axis_id': axisId,
            'data': data
          };
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

      loadGraphData(i, expression, server, axisId);
    }
  };

  if ($scope.graph.axes.length == 0) {
    $scope.addAxis();
  }

  $scope.refreshGraph();
}]);

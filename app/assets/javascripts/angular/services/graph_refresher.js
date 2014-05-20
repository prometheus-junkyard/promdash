angular.module("Prometheus.services").factory('GraphRefresher', ["$http", "VariableInterpolator", function($http, VariableInterpolator) {
  return function($scope) {
    // Collect data for all expressions in this array.
    var allData = [];

    function requestFinished() {
      $scope.requestsInFlight--;
      $scope.data = allData;
    };

    function loadGraphData(idx, expression, server, axisId, expressionId) {
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
            var errMsg = "Expression " + (idx + 1) + ": " + data.Value;
            $scope.errorMessages.push(errMsg);
            break;
          case 'matrix':
            allData[idx] = {
              'axis_id': axisId,
              'exp_id': expressionId,
              'data': data
            };
            break;
          default:
            var errMsg = 'Expression ' + (idx + 1) + ': Result type "' + data.Type + '" cannot be graphed."';
            $scope.errorMessages.push(errMsg);
        }
      }).error(function(data, status, b) {
        var errMsg = "Expression " + (idx + 1) + ": Server returned status " + status + ".";
        $scope.errorMessages.push(errMsg);
      }).finally(function() {
        requestFinished();
      });
    }

    return function() {
      $scope.errorMessages = [];
      for (var i = 0; i < $scope.graph.expressions.length; i++) {
        var exp = $scope.graph.expressions[i];
        var server = $scope.serversById[exp['server_id']];

        if (server == undefined) {
          console.log('No server selected for expression, skipping.');
          continue;
        }

        var axisId = exp['axis_id'];
        var expression = exp.expression;

        loadGraphData(i, VariableInterpolator(expression, $scope.vars), server, axisId, exp.id);
      }
    };
  };
}]);

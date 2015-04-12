angular.module("Prometheus.services").factory('GraphRefresher',
                                              ["$http",
                                               "$q",
                                               "VariableInterpolator",
                                               "URLGenerator",
                                               function($http,
                                                        $q,
                                                        VariableInterpolator,
                                                        URLGenerator) {
  return function($scope) {
    function loadGraphData(idx, expression, server, expressionID, endTime, rangeSeconds, step) {
      var deferred = $q.defer();
      $http.get(URLGenerator(server.url, '/api/query_range', $scope.vars), {
        params: {
          expr: expression,
          range: rangeSeconds,
          end: endTime,
          step: step >= 5 ? step : 5
        },
        cache: false
      }).then(function(payload, status) {
        data = payload.data;
        switch(data.Type || data.type) {
          case 'error':
            var errMsg = "Expression " + (idx + 1) + ": " + (data.Value || data.value);
            $scope.errorMessages.push(errMsg);
            break;
          case 'matrix':
            deferred.resolve({
              'exp_id': expressionID,
              'data': data
            });
            break;
          default:
            var errMsg = 'Expression ' + (idx + 1) + ': Result type "' + (data.Type || data.type) + '" cannot be graphed."';
            $scope.errorMessages.push(errMsg);
        }
      }, function(data, status, b) {
        var errMsg = "Expression " + (idx + 1) + ": Server returned status " + status + ".";
        $scope.errorMessages.push(errMsg);
      });
      return deferred.promise;
    }

    return function(endTime, rangeSeconds, step) {
      var deferred = $q.defer();
      var promises = [];
      $scope.errorMessages = [];
      for (var i = 0; i < $scope.graph.expressions.length; i++) {
        var exp = $scope.graph.expressions[i];
        var server = $scope.serversById[exp.serverID];
        if (server === undefined || !exp.expression) {
          continue;
        }
        var expression = VariableInterpolator(exp.expression, $scope.vars);
        $scope.requestsInFlight = true;
        promises[i] = loadGraphData(i, expression, server, exp.id, endTime, rangeSeconds, step);
      }
      $q.all(promises).then(function(data) {
        $scope.requestsInFlight = false;
        deferred.resolve(data);
      });
      return deferred.promise;
    };
  };
}]);

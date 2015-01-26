angular.module("Prometheus.services").factory('GraphRefresher',
                                              ["$http",
                                               "$q",
                                               "VariableInterpolator",
                                               function($http,
                                                        $q,
                                                        VariableInterpolator) {
  return function($scope) {
    function loadGraphData(idx, expression, server, expressionID, rangeSeconds, step, allData) {
      var url = document.createElement('a');
      url.href = server.url;
      url.pathname = 'api/query_range'
      return $http.get(url.href, {
        params: {
          expr: expression,
          range: rangeSeconds,
          end: Math.floor($scope.graph.endTime / 1000),
          step: step >= 5 ? step : 5
        },
        cache: false
      }).success(function(data, status) {
        switch(data.Type || data.type) {
          case 'error':
            var errMsg = "Expression " + (idx + 1) + ": " + (data.Value || data.value);
            $scope.errorMessages.push(errMsg);
            break;
          case 'matrix':
            allData[idx] = {
              'exp_id': expressionID,
              'data': data
            };
            break;
          default:
            var errMsg = 'Expression ' + (idx + 1) + ': Result type "' + (data.Type || data.type) + '" cannot be graphed."';
            $scope.errorMessages.push(errMsg);
        }
      }).error(function(data, status, b) {
        var errMsg = "Expression " + (idx + 1) + ": Server returned status " + status + ".";
        $scope.errorMessages.push(errMsg);
      });
    }

    return function(rangeSeconds, step) {
      var deferred = $q.defer();
      var promises = [];
      var allData = [];
      $scope.errorMessages = [];
      for (var i = 0; i < $scope.graph.expressions.length; i++) {
        var exp = $scope.graph.expressions[i];
        var server = $scope.serversById[exp['serverID']];
        if (server === undefined) {
          continue;
        }
        var expression = VariableInterpolator(exp.expression, $scope.vars);
        $scope.requestsInFlight = true;
        promises.push(
          loadGraphData(i, expression, server, exp.id, rangeSeconds, step, allData)
        );
      }
      $q.all(promises).then(function() {
        $scope.requestsInFlight = false;
        deferred.resolve(allData);
      });
      return deferred.promise;
    };
  };
}]);

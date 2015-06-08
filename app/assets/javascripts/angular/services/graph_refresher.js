angular.module("Prometheus.services").factory('GraphRefresher',
                                              ["$http",
                                               "$q",
                                               "VariableInterpolator",
                                               "URLGenerator",
                                               "GraphiteTimeConverter",
                                               function($http,
                                                        $q,
                                                        VariableInterpolator,
                                                        URLGenerator,
                                                        GraphiteTimeConverter) {
  return function($scope) {
    var loadGraphData = {
      prometheus: function(idx, expression, server, expressionID, endTime, range, step) {
        var rangeSeconds = Prometheus.Graph.parseDuration($scope.graph.range);
        var endTime = Math.floor(endTime / 1000);
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
                expID: expressionID,
                type: server.server_type,
                data: data
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
      },
      graphite: function(idx, expression, server, expressionID, endTime, range, step) {
        var deferred = $q.defer();
        $http.get(URLGenerator(server.url, 'render', $scope.vars), {
          params: {
            target: expression,
            from: GraphiteTimeConverter.graphiteFrom(range, endTime),
            until: GraphiteTimeConverter.graphiteUntil(endTime),
            format: 'json'
          },
        }).then(function(payload, status) {
          deferred.resolve(payload.data.map(function (d) {
            return {
              expID: expressionID,
              type: server.server_type,
              data: d
            };
          }));
        });
        return deferred.promise;
      }
    };

    return function(endTime, range, step) {
      var deferred = $q.defer();
      $scope.errorMessages = [];
      var promises = $scope.graph.expressions.map(function(exp, i){
        var server = $scope.serversById[exp.serverID];
        if (server === undefined || !exp.expression) {
          return;
        }
        var expression = VariableInterpolator(exp.expression, $scope.vars);
        $scope.requestsInFlight = true;
        return loadGraphData[server.server_type](i, expression, server, exp.id, endTime, range, step);
      });
      $q.all(promises).then(function(data) {
        $scope.requestsInFlight = false;
        deferred.resolve($.map(data, function(n) { return n; }));
      });
      return deferred.promise;
    };
  };
}]);

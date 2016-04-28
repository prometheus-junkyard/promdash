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
      prometheus: function(idx, expression, server, expressionID, startTime, endTime, step) {
        var endTime = Math.floor(endTime / 1000);
        var startTime = Math.floor(startTime / 1000);
        var deferred = $q.defer();
        $http.get(URLGenerator(server.url, '/api/v1/query_range', $scope.vars), {
          params: {
            query: expression,
            start: startTime,
            end: endTime,
            step: (step >= 5 ? step : 5) + "s"
          },
          cache: false
        }).then(function(payload, status) {
          data = payload.data;
          switch (data.status) {
            case 'error':
              var errMsg = "Expression " + (idx + 1) + ": " + data.error;
              $scope.errorMessages.push(errMsg);
              break;
            case 'success':
              deferred.resolve({
                expID: expressionID,
                type: server.server_type,
                data: data.data.result
              });
              break;
            default:
              var errMsg = 'Expression ' + (idx + 1) + ': Result type "' + data.type + '" cannot be graphed."';
              $scope.errorMessages.push(errMsg);
          }
        }, function(data, status, b) {
          var errMsg = "Expression " + (idx + 1) + ": Server returned status " + status + ".";
          $scope.errorMessages.push(errMsg);
        });
        return deferred.promise;
      },
      graphite: function(idx, expression, server, expressionID, startTime, endTime, step) {
        var deferred = $q.defer();
        $http.get(URLGenerator(server.url, 'render', $scope.vars), {
          params: {
            target: expression,
            from: GraphiteTimeConverter.convert(startTime),
            until: GraphiteTimeConverter.convert(endTime),
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

    return function(startTime, endTime, step) {
      var deferred = $q.defer();
      $scope.errorMessages = [];
      var promises = $scope.graph.expressions.map(function(exp, i){
        var server = $scope.serversById[exp.serverID];
        if (server === undefined || !exp.expression) {
          return;
        }
        var expression = VariableInterpolator(exp.expression, $scope.vars);
        $scope.requestsInFlight = true;
        return loadGraphData[server.server_type](i, expression, server, exp.id, startTime, endTime, step);
      });
      $q.all(promises).then(function(data) {
        $scope.requestsInFlight = false;
        deferred.resolve($.map(data, function(n) { return n; }));
      });
      return deferred.promise;
    };
  };
}]);

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
      prometheus: function(idx, server, path, expressionID, params) {
        params.range = Prometheus.Graph.parseDuration(params.range);
        params.end = Math.floor(params.end / 1000);
        var deferred = $q.defer();
        $http.get(URLGenerator(server.url, path, $scope.vars), {
          params: params,
          cache: false
        }).then(function(payload, status) {
          data = payload.data;
          switch (data.type) {
            case 'error':
              var errMsg = "Expression " + (idx + 1) + ": " + data.value;
              $scope.errorMessages.push(errMsg);
              break;
            case 'matrix':
              deferred.resolve({
                expID: expressionID,
                type: server.server_type,
                data: data
              });
              break;
            case 'vector':
              var d = data.value;
              d.forEach(function(s) {
                s.metric.serverName = server.name;
                s.expressionID = expressionID;
              });
              deferred.resolve(d);
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
      graphite: function(idx, server, path, expressionID, params) {
        var deferred = $q.defer();
        $http.get(URLGenerator(server.url, 'render', $scope.vars), {
          params: {
            target: params.expr,
            from: GraphiteTimeConverter.graphiteFrom(params.range, params.end),
            until: GraphiteTimeConverter.graphiteUntil(params.end),
            format: 'json',
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

    return function(path, params) {
      var deferred = $q.defer();
      $scope.errorMessages = [];
      var promises = $scope.graph.expressions.map(function(exp, i){
        var server = $scope.serversById[exp.serverID];
        if (server === undefined || !exp.expression) {
          return;
        }
        params.expr = VariableInterpolator(exp.expression, $scope.vars);
        $scope.requestsInFlight = true;
        return loadGraphData[server.server_type](i, server, path, exp.id, $.extend({}, params));
      });
      $q.all(promises).then(function(data) {
        $scope.requestsInFlight = false;
        deferred.resolve($.map(data, function(n) { return n; }));
      });
      return deferred.promise;
    };
  };
}]);

angular.module("Prometheus.controllers").controller('PieCtrl',
                                                    ["$scope", "$http",
                                                      "SharedWidgetSetup",
                                                      "URLGenerator",
                                                      "VariableInterpolator",
                                                      function($scope,
                                                               $http,
                                                               SharedWidgetSetup,
                                                               URLGenerator,
                                                               VariableInterpolator) {
  SharedWidgetSetup($scope);
  $scope.errorMessages = [];

  // Query for the data.
  $scope.refreshGraph = function() {
    var exp = $scope.graph.expression;
    var server = $scope.serversById[exp.serverID || 1];
    if (server === undefined || !exp.expression) {
      return;
    }
    $scope.requestInFlight = true;
    $http.get(URLGenerator(server.url, '/api/v1/query', $scope.vars), {
      params: {
        query: VariableInterpolator(exp.expression, $scope.vars)
      }
    }).then(function(payload) {
      var data = payload.data;
      var errMsg;
      switch (data.status) {
        case 'error':
          errMsg = "Expression " + exp.expression + ": " + data.value;
          $scope.errorMessages.push(errMsg);
          break;
        case 'success':
          data = data.data;
          if (data.resultType != "vector") {
            errMsg = 'Expression ' + exp.expression + ': Result type "' + data.resultType + '" cannot be graphed."';
            $scope.errorMessages.push(errMsg);
            break;
          }
          $scope.$broadcast('redrawGraphs', data.result);
          $scope.errorMessages = [];
          break;
        default:
          errMsg = 'Expression ' + exp.expression + ': API error';
          $scope.errorMessages.push(errMsg);
      }
    }, function(data, status, b) {
      var errMsg = "Expression " + exp.expression  + ": Server returned status " + status + ".";
      $scope.errorMessages.push(errMsg);
    }).finally(function() {
      $scope.requestInFlight = false;
    });
  };

  $scope.refreshGraph();

  $scope.$on('changeExpression', function(ev) {
    $scope.refreshGraph();
  });

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

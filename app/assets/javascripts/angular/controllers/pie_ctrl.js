angular.module("Prometheus.controllers").controller('PieCtrl',
                                                    ["$scope", "$http",
                                                      "SharedWidgetSetup",
                                                      "URLGenerator",
                                                      function($scope,
                                                               $http,
                                                               SharedWidgetSetup,
                                                               URLGenerator) {
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
    $http.get(URLGenerator(server.url, '/api/query', $scope.vars), {
      params: {
        expr: exp.expression
      }
    }).then(function(payload) {
      var data = payload.data;
      var errMsg;
      switch(data.Type || data.type) {
        case 'error':
          errMsg = "Expression " + exp.expression + ": " + (data.Value || data.value);
          $scope.errorMessages.push(errMsg);
          break;
        case 'vector':
          $scope.$broadcast('redrawGraphs', data.Value || data.value);
          $scope.errorMessages = [];
          break;
        default:
          errMsg = 'Expression ' + exp.expression + ': Result type "' + (data.Type || data.type) + '" cannot be graphed."';
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

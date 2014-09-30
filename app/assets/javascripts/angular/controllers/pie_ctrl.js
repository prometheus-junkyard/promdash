angular.module("Prometheus.controllers").controller('PieCtrl',
                                                    ["$scope", "$http",
                                                      "SharedWidgetSetup",
                                                      function($scope,
                                                               $http,
                                                               SharedWidgetSetup) {
  SharedWidgetSetup($scope);
  $scope.errorMessages = [];

  // Query for the data.
  $scope.refreshGraph = function() {
    var exp = $scope.graph.expression;
    var server = $scope.serversById[exp['server_id'] || 1];
    $scope.requestInFlight = true;
    $http.get(server.url + "api/query", {
      params: {
        expr: exp.expression
      }
    }).then(function(payload) {
      $scope.$broadcast('redrawGraphs', payload.data.Value);
    }, function(data, status, b) {
      var errMsg = "Expression " + exp.expression  + ": Server returned status " + status + ".";
      $scope.errorMessages.push(errMsg);
    }).finally(function() {
      $scope.requestInFlight = false;
    });
  };

  if ($scope.graph.expression.expression) {
    $scope.refreshGraph();
  }

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

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
    var server = $scope.serversById[exp['serverID'] || 1];
    if (server === undefined) {
      return;
    }
    $scope.requestInFlight = true;
    var url = document.createElement('a');
    url.href = server.url;
    url.pathname = 'api/query'
    $http.get(url.href, {
      params: {
        expr: exp.expression
      }
    }).then(function(payload) {
      $scope.$broadcast('redrawGraphs', payload.data.Value || payload.data.value);
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

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
      var data = payload.data;
      switch(data.Type || data.type) {
        case 'error':
          var errMsg = "Expression " + exp.expression + ": " + (data.Value || data.value);
          $scope.errorMessages.push(errMsg);
          break;
        case 'vector':
          $scope.$broadcast('redrawGraphs', data.Value || data.value);
          $scope.errorMessages = [];
          break;
        default:
          var errMsg = 'Expression ' + exp.expression + ': Result type "' + (data.Type || data.type) + '" cannot be graphed."';
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

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

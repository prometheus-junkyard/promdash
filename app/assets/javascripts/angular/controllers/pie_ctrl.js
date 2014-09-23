angular.module("Prometheus.controllers").controller('PieCtrl',
                                                    ["$scope", "$http",
                                                      "SharedWidgetSetup",
                                                      function($scope,
                                                               $http,
                                                               SharedWidgetSetup) {
  SharedWidgetSetup($scope);


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
      // success
      $scope.data = payload.data;
    }, function() {
      // failure
    }).finally(function() {
      $scope.requestInFlight = false;
    });
  };

  if (!$scope.graph.expression){
    var serverId = 0;
    var id = 0;
    if ($scope.servers.length != 0) {
      serverId = $scope.servers[0]['id'];
    }

    $scope.graph.expression = {
      'id': id,
      'server_id': serverId,
      'expression': ''
    };
  } else if ($scope.graph.expression.expression) {
    $scope.refreshGraph();
  }

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

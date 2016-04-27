angular.module("Prometheus.controllers").controller('GaugeCtrl',
                                                    ["$scope",
                                                      "$http",
                                                      "$timeout",
                                                      "SharedWidgetSetup",
                                                      "VariableInterpolator",
                                                      "URLGenerator",
                                                      function($scope,
                                                               $http,
                                                               $timeout,
                                                               SharedWidgetSetup,
                                                               VariableInterpolator,
                                                               URLGenerator) {
  SharedWidgetSetup($scope);
  $scope.errorMessages = [];

  // Query for the data.
  $scope.refreshGraph = function() {
    var exp = $scope.graph.expression;
    var server = $scope.serversById[exp.serverID];
    if (server === undefined || exp.expression === '') {
      $scope.errorMessages = [];
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
      $scope.errorMessages = [];
      switch (data.status) {
        case 'error':
          errMsg = "Expression " + exp.expression + ": " + data.error;
          $scope.errorMessages.push(errMsg);
          break;
        case 'success':
          data = data.data;
          if (data.resultType != "scalar") {
            errMsg = 'Expression ' + exp.expression + ': Result type "' + data.resultType + '" cannot be graphed."';
            $scope.errorMessages.push(errMsg);
            break;
          }

          if (!data.result) {
            errMsg = 'Expression ' + exp.expression + ': Result type "' + data.resultType + '" has no data."';
            $scope.errorMessages.push(errMsg);
            return;
          }
          var d = parseFloat(data.result[0]);

          $scope.$broadcast('redrawGraphs', d);
          $scope.errorMessages = [];
          break;
        default:
          errMsg = 'Expression ' + exp.expression + ': API error.';
          $scope.errorMessages.push(errMsg);
      }
    }, function(data, status, b) {
      var errMsg = "Expression " + exp.expression  + ": Server returned status " + status + ".";
      $scope.errorMessages.push(errMsg);
    }).finally(function() {
      $scope.requestInFlight = false;
    });
  };

  var refresh;
  function refreshLoop() {
    refresh = $timeout(function() {
      $scope.refreshGraph();
      refreshLoop();
    }, $scope.graph.refresh*1000);
  }

  function startRefreshLoop() {
    $timeout.cancel(refresh);
    if (!$scope.graph.refresh) {
      return;
    }
    $scope.refreshGraph();
    refreshLoop();
  }

  $scope.refreshGraph();
  startRefreshLoop();

  $scope.$watch('graph.refresh', function() {
    $scope.refreshGraph();
  });

  $scope.$on('changeExpression', function(ev) {
    $scope.refreshGraph();
    startRefreshLoop();
  });

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

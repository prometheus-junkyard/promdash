angular.module("Prometheus.controllers").controller('PieCtrl',
                                                    ["$scope", "$http",
                                                      "SharedWidgetSetup",
                                                      "URLGenerator",
                                                      "GraphRefresher",
                                                      function($scope,
                                                               $http,
                                                               SharedWidgetSetup,
                                                               URLGenerator,
                                                               GraphRefresher) {
  SharedWidgetSetup($scope);
  $scope.errorMessages = [];

  $scope.refreshGraph = function(scope) {
    var refreshFn = GraphRefresher(scope);
    return function() {
      refreshFn('/api/query', {}).then(function(data) {
        var flatData = $.map(data, function(n) { return n; });
        scope.$broadcast('redrawGraphs', flatData);
      });
    };
  }($scope);

  $scope.refreshGraph();

  $scope.$on('changeExpression', function(ev) {
    $scope.refreshGraph();
  });

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

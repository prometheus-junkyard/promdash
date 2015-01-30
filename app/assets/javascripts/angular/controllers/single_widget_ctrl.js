angular.module("Prometheus.controllers").controller('SingleWidgetCtrl', ["$window", "$timeout", "$scope", "$http", "URLConfigDecoder", "VariableInterpolator", "GraphRefresher", "ServersByIDObject", "FullScreenAspectRatio", "ThemeManager", function($window, $timeout, $scope, $http, URLConfigDecoder, VariableInterpolator, GraphRefresher, ServersByIDObject, FullScreenAspectRatio, ThemeManager) {
  var graphBlob = URLConfigDecoder(blob);
  $scope.widget = graphBlob.widget;
  $scope.servers = servers;
  $scope.serversById = ServersByIDObject($scope.servers);
  $scope.globalConfig = graphBlob.globalConfig;
  $scope.globalConfig.aspectRatio = FullScreenAspectRatio();
  ThemeManager.setTheme($scope.globalConfig.theme);
  SharedGraphBehavior($scope);

  $window.onresize = function() {
    $scope.$apply(function() {
      // Need to $apply to propagate aspectRatio change,
      // and then redraw on the next event loop to have accurate aspectRatio
      $scope.globalConfig.aspectRatio = FullScreenAspectRatio();
      $timeout(function() {
        $scope.$broadcast('redrawGraphs');
      });
    });
  }
}]);

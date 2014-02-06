angular.module("Prometheus.controllers").controller('SingleWidgetCtrl', ["$window", "$timeout", "$scope", "$http", "UrlConfigDecoder", "VariableInterpolator", "GraphRefresher", "WidgetHeightCalculator", "ServersByIdObject", "FullScreenAspectRatio", "ThemeService", function($window, $timeout, $scope, $http, UrlConfigDecoder, VariableInterpolator, GraphRefresher, WidgetHeightCalculator, ServersByIdObject, FullScreenAspectRatio, ThemeService) {
  var graphBlob = UrlConfigDecoder();
  $scope.widget = graphBlob.widget;
  $scope.servers = servers;
  $scope.serversById = ServersByIdObject($scope.servers);
  $scope.globalConfig = graphBlob.globalConfig;
  $scope.globalConfig.aspectRatio = FullScreenAspectRatio();
  ThemeService.theme = $scope.globalConfig.theme;

  // Widget should always fill screen, whether graph or frame.
  $scope.frameHeight = function() {
    return {
      height: WidgetHeightCalculator(angular.element(".js_widget_wrapper")[0], $scope.globalConfig.aspectRatio)
    }
  }

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

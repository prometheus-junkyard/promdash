angular.module("Prometheus.controllers").controller('SingleWidgetCtrl', ["$window", "$timeout", "$scope", "$http", "URLConfigDecoder", "GraphRefresher", "ServersByIDObject", "FullScreenAspectRatio", "ThemeManager", "SharedGraphBehavior", "Profile", "DashboardVariables", function($window, $timeout, $scope, $http, URLConfigDecoder, GraphRefresher, ServersByIDObject, FullScreenAspectRatio, ThemeManager, SharedGraphBehavior, Profile, DashboardVariables) {
  var graphBlob = URLConfigDecoder(window.blob);
  $scope.widgets = [graphBlob.widget];
  $scope.servers = servers;
  $scope.serversById = ServersByIDObject($scope.servers);
  $scope.globalConfig = graphBlob.globalConfig || {};
  $scope.globalConfig.theme = $scope.globalConfig.theme || 'dark_theme';
  $scope.globalConfig.aspectRatio = FullScreenAspectRatio();
  ThemeManager.setTheme($scope.globalConfig.theme);
  SharedGraphBehavior($scope, $scope.globalConfig);

  if (graphBlob.activeProfileName) {
    var profile = $scope.globalConfig.profiles[graphBlob.activeProfileName];
    if (profile) {
      var parsedProfile = Profile.unmarshal([profile])[0];
      $scope.globalConfig.vars = DashboardVariables.mergeToObject($scope.globalConfig.vars, parsedProfile.variablePairs);
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
  };
}]);

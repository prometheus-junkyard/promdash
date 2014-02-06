angular.module("Prometheus.controllers").controller('ThemeCtrl', ["$scope", "ThemeService", function($scope, ThemeService) {
  ThemeService.theme = (dashboardData.globalConfig || {}).theme;
  $scope.theme = function() {
    return ThemeService.theme;
  };
}]);

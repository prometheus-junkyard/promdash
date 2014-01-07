angular.module("Prometheus.controllers").controller('ThemeCtrl', function($scope) {
  $scope.theme = (dashboardData.globalConfig || {theme: "light_theme"}).theme;

  $scope.$on("themeChange", function(event, newTheme) {
    $scope.theme = newTheme;
  });
});

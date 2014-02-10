angular.module("Prometheus.controllers").controller('ThemeCtrl', ["$scope", "ThemeManager", function($scope, ThemeManager) {
  $scope.theme = function() {
    return ThemeManager.theme;
  };
}]);

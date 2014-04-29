angular.module("Prometheus.controllers").controller('ThemeCtrl', ["$scope", "ThemeManager", "ModalService", function($scope, ThemeManager, ModalService) {
  $scope.theme = function() {
    return ThemeManager.theme;
  };

  $scope.ModalService = ModalService;
}]);

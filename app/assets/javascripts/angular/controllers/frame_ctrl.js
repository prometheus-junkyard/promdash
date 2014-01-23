angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope", "$sce", "VariableInterpolator", function($scope, $sce, VariableInterpolator) {
  // Appended to frame source URL to trigger refresh.
  $scope.refreshCounter = 0;

  $scope.removeFrame = function() {
    $scope.$emit('removeWidget', $scope.index);
  };

  $scope.toggleTab = function(tab) {
    $scope.showTab = $scope.showTab == tab ? null : tab;
  };

  $scope.getTitle = function() {
    if ($scope.frame.title) {
      return VariableInterpolator($scope.frame.title, $scope.vars);
    } else if ($scope.frame.url) {
      if ($scope.frame.url.length > 60) {
        return $scope.frame.url.substr(0, 57) + '...';
      }
      return $scope.frame.url;
    } else {
      return "New Frame";
    }
  };

  $scope.refreshFrame = function() {
    $scope.refreshCounter++;
    $scope.frameURL = $sce.trustAsResourceUrl(VariableInterpolator($scope.frame.url, $scope.vars) + "?decache=" + $scope.refreshCounter);
  };

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshFrame();
  });

  $scope.refreshFrame();
}]);

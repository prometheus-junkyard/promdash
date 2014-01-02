angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope", function($scope) {
  // Appended to frame source URL to trigger refresh.
  $scope.refreshCounter = 0;

  $scope.removeFrame = function(idx) {
    $scope.widgets.splice(idx, 1);
  };

  $scope.toggleTab = function(tab) {
    $scope.showTab = $scope.showTab == tab ? null : tab;
  };

  $scope.getTitle = function() {
    if ($scope.frame.title) {
      return $scope.frame.title;
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
  };

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshFrame();
  });
}]);

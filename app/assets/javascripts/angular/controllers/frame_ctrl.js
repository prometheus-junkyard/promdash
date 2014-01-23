angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope", "$sce", "VariableInterpolator", function($scope, $sce, VariableInterpolator) {
  // Appended to frame source URL to trigger refresh.
  $scope.refreshCounter = 0;

  $scope.removeFrame = function() {
    $scope.$emit('removeWidget', $scope.index);
  };

  $scope.toggleTab = function(tab) {
    $scope.showTab = $scope.showTab == tab ? null : tab;
  };

  function createGraphiteURL() {
    var parser = document.createElement('a');
    parser.href = $scope.frame.url;
    var queryStringComponents = parser.search.substring(1).split('&');
    queryStringComponents = queryStringComponents.map(function(e) {
      if (e.indexOf('height=') === 0 ) {
        return setDimension(e, $scope.frameHeight().height);
      } else if (e.indexOf('width=') === 0) {
        var width = $scope.frameHeight().height / $scope.aspectRatio;
        return setDimension(e, width);
      }
      return e;
    });
    parser.search = '?' + queryStringComponents.join('&') + '&decache=' + $scope.refreshCounter;
    return parser.href;
  }

  function setDimension(dimensionKeyValue, dimensionValue) {
    var split = dimensionKeyValue.split("=");
    split[1] = dimensionValue;
    return split.join("=");
  }

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

  $scope.frameURL = function() {
    if ($scope.frame.graphite) {
      return $sce.trustAsResourceUrl(createGraphiteURL());
    } else {
      return $sce.trustAsResourceUrl(VariableInterpolator($scope.frame.url, $scope.vars) + "?decache=" + $scope.refreshCounter);
    }
  };

  $scope.refreshFrame = function() {
    $scope.refreshCounter++;
    $scope.frameURL();
  };

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshFrame();
  });

  $scope.refreshFrame();
}]);

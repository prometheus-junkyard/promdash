angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope", "$sce", "VariableInterpolator", "UrlHashEncoder", "InputHighlighter", function($scope, $sce, VariableInterpolator, UrlHashEncoder, InputHighlighter) {
  // Appended to frame source URL to trigger refresh.
  $scope.refreshCounter = 0;

  $scope.generateWidgetLink = function(event) {
    var graphBlob = {};
    graphBlob.widget = $scope.frame;
    graphBlob.globalConfig = dashboardData.globalConfig;
    $scope.widgetLink = location.origin + "/widget##" + UrlHashEncoder(graphBlob);

    if (event) {
      // TODO: find more robust means of accessing the corresponding input field.
      var input = event.currentTarget.parentElement.parentElement.querySelector("[ng-model=widgetLink]")
      InputHighlighter(input);
    }
  };

  $scope.removeFrame = function() {
    $scope.$emit('removeWidget', $scope.index);
  };

  $scope.toggleTab = function(tab) {
    $scope.showTab = $scope.showTab == tab ? null : tab;
  };

  function buildFrameURL(url) {
    var parser = document.createElement('a');
    parser.href = url;
    var queryStringComponents = parser.search.substring(1).split('&');
    if ($scope.frame.graphite) {
      queryStringComponents = queryStringComponents.map(function(e) {
        if (e.indexOf('height=') === 0 ) {
          return setDimension(e, $scope.frameHeight().height);
        } else if (e.indexOf('width=') === 0) {
          var width = $scope.frameHeight().height / $scope.aspectRatio;
          return setDimension(e, width);
        }
        return e;
      });
    }
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
    var url = VariableInterpolator($scope.frame.url, $scope.vars);
    return $sce.trustAsResourceUrl(buildFrameURL(url));
  };

  $scope.updateUrl = function() {
    $scope.frame.url = $scope.urlInput;
  };

  $scope.urlInput = $scope.frame.url;

  $scope.refreshFrame = function() {
    $scope.refreshCounter++;
  };

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshFrame();
  });
}]);

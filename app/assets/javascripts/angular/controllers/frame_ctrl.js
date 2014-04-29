angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope", "$sce", "VariableInterpolator", "UrlHashEncoder", "InputHighlighter", "WidgetLinkHelper", "GraphiteTimeConverter", "ModalService", function($scope, $sce, VariableInterpolator, UrlHashEncoder, InputHighlighter, WidgetLinkHelper, GraphiteTimeConverter, ModalService) {
  // Appended to frame source URL to trigger refresh.
  $scope.refreshCounter = 0;

  $scope.generateWidgetLink = function(event) {
    if ($scope.showTab !== 'staticlink') {
      return;
    }
    var graphBlob = {};
    graphBlob.widget = $scope.frame;
    graphBlob.globalConfig = dashboardData.globalConfig;
    WidgetLinkHelper
      .createLink({
         encoded_url: UrlHashEncoder(graphBlob),
         graph_title: $scope.getTitle(),
         dashboard_name: dashboardName
       }, event)
      .setLink($scope)
      .highlightInput(event);
  };

  $scope.removeFrame = function() {
    $scope.$emit('removeWidget', $scope.index);
    $scope.closeFrameDelete();
  };

  $scope.$on('closeModal', function() {
    $scope.showFrameDelete = false;
  });

  $scope.closeFrameDelete = function() {
    ModalService.closeModal();
  };

  $scope.frameDeleteModal = function() {
    ModalService.toggleModal();
    $scope.showFrameDelete = true;
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
        switch (0) {
        case e.indexOf('height='):
          return setDimension(e, $scope.frameHeight().height);
        case e.indexOf('width='):
          var width = $scope.frameHeight().height / $scope.aspectRatio;
          return setDimension(e, width);
        case e.indexOf('from='):
          if (!$scope.frame.range) {
            return e;
          }
          return setDimension(e, GraphiteTimeConverter.graphiteFrom($scope.frame.range, $scope.frame.endTime));
        case e.indexOf('until='):
          return setDimension(e, GraphiteTimeConverter.graphiteUntil($scope.frame.endTime));
        }
        return e;
      });
      queryStringComponents.push("bgcolor=%23191919");
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

  $scope.$on('setRange', function(ev, range) {
    $scope.frame.range = range;
  });

  $scope.$on('setEndTime', function(ev, endTime) {
    $scope.frame.endTime = endTime;
  });

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshFrame();
  });
}]);

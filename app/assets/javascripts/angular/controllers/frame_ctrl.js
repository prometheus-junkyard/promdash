angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope",
                                                    "$sce", "$timeout",
                                                    "VariableInterpolator",
                                                    "URLHashEncoder",
                                                    "InputHighlighter",
                                                    "WidgetLinkHelper",
                                                    "GraphiteTimeConverter",
                                                    "WidgetTabService",
                                                    function($scope, $sce,
                                                             $timeout,
                                                             VariableInterpolator,
                                                             URLHashEncoder,
                                                             InputHighlighter,
                                                             WidgetLinkHelper,
                                                             GraphiteTimeConverter,
                                                             WidgetTabService) {
  WidgetTabService($scope);

  $scope.generateWidgetLink = function(event) {
    if ($scope.showTab !== 'staticlink') {
      return;
    }
    var graphBlob = {};
    graphBlob.widget = $scope.frame;
    graphBlob.globalConfig = dashboardData.globalConfig;
    WidgetLinkHelper
      .createLink({
         encoded_url: URLHashEncoder(graphBlob),
         graph_title: $scope.getTitle(),
         dashboard_name: dashboardName
       }, event)
      .setLink($scope)
      .highlightInput(event);
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

  $scope.$on('setRange', function(ev, range) {
    $scope.frame.range = range;
  });

  $scope.$on('setEndTime', function(ev, endTime) {
    $scope.frame.endTime = endTime;
  });

  $scope.generateFrameComponents = function() {
    var parser = document.createElement("a");
    parser.href = $scope.frame.url;
    // [foo=bar, baz=quux]
    var queryStringComponents = parser.search.substring(1).split("&");
    // [{foo: bar}, {baz: quux}]
    $scope.frameComponents = queryStringComponents.map(function(kv) {
      var kvArr = kv.split("=");
      return {
        key: kvArr[0],
        value: kvArr[1] === undefined ? undefined : decodeURIComponent(kvArr[1]),
      };
    });
  };

  $scope.generateFrameComponents();

  $scope.skipComponent = function(key) {
    return ["width", "height", "from", "until"].indexOf(key) > -1;
  };

  $scope.$watch("frameComponents", function(newValue, oldValue) {
    if (angular.equals(newValue, oldValue)) {
      return;
    }
    var parser = document.createElement("a");
    parser.href = $scope.frame.url;
    parser.search = "?" + $scope.frameComponents.map(function(o) {
      if (o.value !== undefined) {
        return o.key + "=" + encodeURIComponent(o.value);
      } else {
        return o.key;
      }
    }).join("&");
    $scope.frame.url = parser.href;
  }, true);
}]);

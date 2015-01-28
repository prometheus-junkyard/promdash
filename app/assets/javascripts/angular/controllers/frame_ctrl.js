angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope",
                                                    "$sce", "$timeout",
                                                    "VariableInterpolator",
                                                    "URLHashEncoder",
                                                    "InputHighlighter",
                                                    "WidgetLinkHelper",
                                                    "GraphiteTimeConverter",
                                                    "WidgetTabService",
                                                    "WidgetHeightCalculator",
                                                    function($scope, $sce,
                                                             $timeout,
                                                             VariableInterpolator,
                                                             URLHashEncoder,
                                                             InputHighlighter,
                                                             WidgetLinkHelper,
                                                             GraphiteTimeConverter,
                                                             WidgetTabService,
                                                             WidgetHeightCalculator) {
  // Appended to frame source URL to trigger refresh.
  $scope.refreshCounter = 0;
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

  function buildFrameURL(url) {
    var parser = document.createElement('a');
    parser.href = url;
    if ($scope.frame.graphite) {
      return parseGraphiteURL(parser);
    }
    parser.search = parser.search + '&decache=' + $scope.refreshCounter;
    return parser.href;
  }

  function parseGraphiteURL(parser) {
      var queryStringComponents = parser.search.substring(1).split('&');
      var fields = {};
      var targets = [];
      queryStringComponents.forEach(function(f) {
        var s = f.split('=');
        // If there are more than 1 target in the query string, they get overridden.
        // So we can't put them in the fields object.
        if (s[0] !== 'target') {
          fields[s.shift()] = s.join('=');
        } else {
          targets.push(f);
        }
      });

      fields['height'] = $scope.frameHeight().height;
      fields['width'] = $scope.frameHeight().height / $scope.aspectRatio;
      fields['from'] = GraphiteTimeConverter.graphiteFrom($scope.frame.range, $scope.frame.endTime);
      fields['until'] = GraphiteTimeConverter.graphiteUntil($scope.frame.endTime);
      fields['bgcolor'] = '%23191919'
      parser.search = '?' + decodeURI($.param(fields)) + '&' + targets.join('&') + '&decache=' + $scope.refreshCounter;
      return parser.href;
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

  $scope.frameHeight = function() {
    return {
      height: WidgetHeightCalculator(angular.element(".js_widget_wrapper")[0], $scope.aspectRatio)
    }
  }

  $scope.refreshFrame = function() {
    $scope.refreshCounter++;
  };

  $scope.$on('setRange', function(ev, range) {
    $scope.frame.range = range;
  });

  $scope.$on('setRangeNoRefresh', function(ev, range) {
    $scope.frame.range = range;
  });

  $scope.$on('setEndTime', function(ev, endTime) {
    $scope.frame.endTime = endTime;
  });

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshFrame();
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
  }

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

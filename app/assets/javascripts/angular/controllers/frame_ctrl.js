angular.module("Prometheus.controllers").controller('FrameCtrl', ["$scope",
                                                    "$sce", "$timeout",
                                                    "VariableInterpolator",
                                                    "URLHashEncoder",
                                                    "InputHighlighter",
                                                    "WidgetLinkHelper",
                                                    "GraphiteTimeConverter",
                                                    "WidgetTabService",
                                                    "URLParser",
                                                    function($scope, $sce,
                                                             $timeout,
                                                             VariableInterpolator,
                                                             URLHashEncoder,
                                                             InputHighlighter,
                                                             WidgetLinkHelper,
                                                             GraphiteTimeConverter,
                                                             WidgetTabService,
                                                             URLParser) {
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
    // This URL should already be unescaped
    var parser = URLParser($scope.frame.url);
    var queryParams = parser.getQueryParams();
    $scope.frameComponents = Object.keys(queryParams).reduce(function(components, key) {
      // possible to have array of values for any key
      [].concat(queryParams[key]).forEach(function (value) {
        components.push({
          key: key,
          value: value
        });
      });
      return components;
    }, []);
  };

  $scope.generateFrameComponents();

  $scope.skipComponent = function(key) {
    return ["width", "height", "from", "until"].indexOf(key) > -1;
  };

  $scope.$watch("frameComponents", function(newValue, oldValue) {
    if (angular.equals(newValue, oldValue)) {
      return;
    }
    initFrameURL();
  }, true);

  function initFrameURL() {
    var parser = URLParser($scope.frame.url);
    var previousParams = Object.keys(parser.getQueryParams());
    var newParams = $scope.frameComponents.reduce(function (params, component) {
      params[component.key] = params[component.key] ? [].concat(params[component.key], component.value) : component.value;
      return params;
    }, {});
    Object.keys(newParams).forEach(function (key) {
      parser.setQueryParam(key, newParams[key]);
    });
    previousParams.forEach(function (key) {
      if (typeof newParams.key !== 'undefined') {
        parser.removeQueryParam(key);
      }
    });
    $scope.frame.url = parser.stringify(false);
  }
  initFrameURL();
}]);

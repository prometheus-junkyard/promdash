angular.module("Prometheus.services").factory("SharedGraphBehavior", ["$http", "$timeout", "UrlConfigDecoder", "UrlVariablesDecoder", "ThemeManager", function($http, $timeout, UrlConfigDecoder, UrlVariablesDecoder, ThemeManager) {
  function commonSetup($scope) {
    $scope.globalConfig = dashboardData.globalConfig || {
      numColumns: 2,
      aspectRatio: 0.75,
      theme: "light_theme",
      endTime: null,
      vars: {}
    };

    $scope.themeChange = function() {
      ThemeManager.setTheme($scope.globalConfig.theme);
    };
    $scope.themeChange();

    // If settings were passed in via the URL hash, merge them into globalConfig.
    var urlConfig = UrlConfigDecoder();
    if (urlConfig.globalConfig) {
      for (var o in urlConfig.globalConfig) {
        $scope.globalConfig[o] = urlConfig.globalConfig[o];
      }
    }
    // If we have manual variable overrides in the hashbang search part of the
    // URL (http://docs.angularjs.org/img/guide/hashbang_vs_regular_url.jpg),
    // merge them into the globalConfig's template vars.
    var urlVars = UrlVariablesDecoder();
    for (var o in urlVars) {
      $scope.globalConfig.vars[o] = urlVars[o];
    }

    $scope.vars = [];
    $scope.servers = servers;
    $scope.showGridSettings = false;
    $scope.sortableOptions = {
      handle: ".widget_title",
    };

    $scope.increaseRange = function() {
      $scope.globalConfig.range = Prometheus.Graph.nextLongerRange($scope.globalConfig.range);
      $scope.setRange();
    };

    $scope.decreaseRange = function() {
      $scope.globalConfig.range = Prometheus.Graph.nextShorterRange($scope.globalConfig.range);
      $scope.setRange();
    };

    $scope.setRange = function() {
      $scope.$broadcast('setRange', $scope.globalConfig.range);
    };

    $scope.increaseEndTime = function() {
      $scope.globalConfig.endTime = Prometheus.Graph.laterEndTime($scope.globalConfig.endTime, $scope.globalConfig.range);
    };

    $scope.decreaseEndTime = function() {
      $scope.globalConfig.endTime = Prometheus.Graph.earlierEndTime($scope.globalConfig.endTime, $scope.globalConfig.range);
    };

    $scope.refreshDashboard = function() {
      $scope.$broadcast('refreshDashboard');
    };

    $scope.redrawGraphs = function() {
      $scope.$broadcast('redrawGraphs');
    };
    $scope.nextCycleRedraw = function() {
      $timeout(function() { $scope.redrawGraphs(); }, 0);
    }

    $scope.addVariable = function(name, value) {
      $scope.vars.push({name: name, value: value});
    };

    for (var o in $scope.globalConfig.vars) {
      $scope.addVariable(o, $scope.globalConfig.vars[o]);
    }

    function setupRefreshTimer(delay) {
      $scope.refreshTimer = $timeout(function() {
        $scope.$broadcast('refreshDashboard');
        setupRefreshTimer(delay);
      }, delay * 1000);
    }

    $scope.$watch('globalConfig.refresh', function() {
      if ($scope.refreshTimer) {
        $timeout.cancel($scope.refreshTimer);
      }
      if ($scope.globalConfig.refresh) {
        setupRefreshTimer(Prometheus.Graph.parseDuration($scope.globalConfig.refresh));
      }
    });
  }

  var sharedGraphBehavior = function($scope) {
    this.$scope = $scope;
    commonSetup($scope);
  };

  return sharedGraphBehavior;
}]);

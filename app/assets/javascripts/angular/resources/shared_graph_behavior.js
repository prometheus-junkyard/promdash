angular.module("Prometheus.services").factory("SharedGraphBehavior", ["$http", "$timeout", "$location", "URLConfigDecoder", "URLVariablesDecoder", "ThemeManager", function($http, $timeout, $location, URLConfigDecoder, URLVariablesDecoder, ThemeManager) {
  function commonSetup($scope, config) {
    $scope.globalConfig = config || {
      numColumns: 2,
      aspectRatio: 0.75,
      theme: "dark_theme",
      endTime: null,
      vars: {}
    };

    $scope.themeChange = function() {
      ThemeManager.setTheme($scope.globalConfig.theme);
    };
    $scope.themeChange();

    // If we have manual variable overrides in the hashbang search part of the
    // URL (http://docs.angularjs.org/img/guide/hashbang_vs_regular_url.jpg),
    // merge them into the globalConfig's template vars.
    $scope.originalRange = $scope.globalConfig.range;
    $scope.originalEndTime = $scope.globalConfig.endTime;
    function decodeURLVars() {
      $scope.vars = [];
      $scope.widgets = $scope.widgets || [];
      var urlVars = URLVariablesDecoder();
      var templateVarRe = /^var\.(.*)$/;
      for (var o in urlVars) {
        var matches = o.match(templateVarRe)
        if (matches) {
          var templateVar = matches[1]
          $scope.globalConfig.vars[templateVar] = urlVars[o];
        }
      }
      for (var o in $scope.globalConfig.vars) {
        $scope.addVariable(o, $scope.globalConfig.vars[o]);
      }
      if (urlVars.fullscreen) {
        $scope.enableFullscreen();
      }

      if (urlVars.fullscreen_title) {
        $scope.fullscreenTitle = true;
      }

      $scope.globalConfig.range = urlVars.range || $scope.originalRange;
      $scope.widgets.forEach(function(w) {
        w.range = $scope.globalConfig.range;
      });
      $scope.setRange();

      var date = $scope.originalEndTime;
      if (urlVars.until) {
        date = Date.parse(urlVars.until);
      }
      $scope.globalConfig.endTime = date;
      $scope.widgets.forEach(function(w) {
        w.endTime = $scope.globalConfig.endTime;
      });
    }

    $scope.$watch(function() {
      return $location.url();
    }, function() {
      decodeURLVars();
    });

    $scope.globalConfig.tags = $scope.globalConfig.tags || [];
    $scope.servers = servers;

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

    $scope.$watch('globalConfig.endTime', function() {
      $scope.$broadcast('setEndTime', $scope.globalConfig.endTime);
    });

    $scope.$watch('globalConfig.palette', function() {
      $scope.$broadcast('setPalette', $scope.globalConfig.palette);
    });

    $scope.$watch('globalConfig.resolution', function() {
      $scope.$broadcast('setResolution', $scope.globalConfig.resolution);
    });

    $scope.$on('timeRangeRescale', function(ev, newTimeSettings) {
      $scope.$apply(function() {
        $scope.globalConfig.range = Prometheus.Graph.durationToString(newTimeSettings.range);
        $scope.globalConfig.endTime = newTimeSettings.endTime;
      });
    });

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

    $scope.addTag = function() {
      $scope.globalConfig.tags.push({});
    };

    $scope.removeTag = function(idx) {
      $scope.globalConfig.tags.splice(idx, 1);
    };

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

    $scope.$watch(function() {
      return $location.search().until;
    }, function(until) {
      if (until) {
        $scope.globalConfig.refresh = '';
        $(".js-refresh").addClass("disabled");
        return
      }
      $(".js-refresh").removeClass("disabled");
    });
  }

  var sharedGraphBehavior = function($scope, config) {
    commonSetup($scope, config);
  };

  return sharedGraphBehavior;
}]);

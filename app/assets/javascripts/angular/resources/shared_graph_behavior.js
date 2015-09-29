angular.module("Prometheus.services").factory("SharedGraphBehavior", ["$http", "$timeout", "$location", "$window", "$document", "URLConfigDecoder", "URLVariablesDecoder", "ThemeManager", function($http, $timeout, $location, $window, $document, URLConfigDecoder, URLVariablesDecoder, ThemeManager) {
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
    function decodeURLVars() {
      $scope.vars = [];
      $scope.widgets = $scope.widgets || [];
      var urlVars = URLVariablesDecoder();
      var templateVarRe = /^var\.(.*)$/;
      for (var o in urlVars) {
        var matches = o.match(templateVarRe);
        if (matches) {
          var templateVar = matches[1];
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

      if (urlVars.range) {
        $scope.globalConfig.range = urlVars.range;
        $scope.widgets.forEach(function(w) {
          if (["pie", "gauge"].indexOf(w.type) === -1) {
            w.range = urlVars.range;
          }
        });
        $scope.setRange();
      }

      if (urlVars.until) {
        var date = Date.parse(urlVars.until);
        $scope.widgets.forEach(function(w) {
          if (["pie", "gauge"].indexOf(w.type) === -1) {
            w.endTime = date;
          }
        });
        $scope.globalConfig.endTime = date;
      }
    }

    function addVarsFromServerInterpolations(servers) {
      var re = /{{\s?(\w+)\s?}}/g;
      var m;
      for (var i = 0; i < servers.length; i++) {
        /* jshint -W084 */
        while (m = re.exec(servers[i].url)) {
          var name = m[1];
          if (m && !$scope.globalConfig.vars[name]) {
            $scope.globalConfig.vars[name] = '';
          }
        }
        /* jshint +W084 */
      }
    }

    $scope.servers = servers;
    addVarsFromServerInterpolations(servers);

    $scope.$watch(function() {
      return $location.url();
    }, function() {
      decodeURLVars();
    });

    $scope.globalConfig.tags = $scope.globalConfig.tags || [];

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

    $scope.$watch("globalConfig", function(newConfig, oldConfig) {
      if (newConfig === oldConfig) {
        return;
      }
      if (newConfig.range) {
        $location.search("range", newConfig.range);
      } else {
        $location.search("range", null);
      }
      if (newConfig.endTime) {
        $location.search("until", (new Date(newConfig.endTime)).toISOString());
      } else {
        $location.search("until", null);
      }
    }, true);

    $scope.refreshDashboard = function() {
      $scope.$broadcast('refreshDashboard');
    };

    $scope.refreshDashboard();

    $scope.redrawGraphs = function() {
      $scope.$broadcast('redrawGraphs');
    };

    $scope.nextCycleRedraw = function() {
      $timeout(function() { $scope.redrawGraphs(); }, 0);
    };

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
        return;
      }
      $(".js-refresh").removeClass("disabled");
    });

    $window.history.replaceState({initial: true}, $("title").text(), $window.location.href);
    var originalEndTime = $scope.globalConfig.endTime;
    var originalRange = $scope.globalConfig.range;
    $document.keydown(function(ev) {
      var Z_KEY = 90;
      var ESC_KEY = 27;
      var validElement = ["INPUT", "TEXTAREA"].indexOf(document.activeElement.tagName) === -1;
      if (ev.keyCode === Z_KEY && validElement) {
        $timeout(function() {
          // If we have reached the initial load state, sets the
          // globalConfig to its original state to cause a graph
          // refresh.
          if ($.isEmptyObject($location.search())) {
            $scope.globalConfig.endTime = originalEndTime;
            $scope.globalConfig.range = originalRange;
          }
        });
        if (($window.history.state || {}).initial) {
          return;
        }
        $window.history.back();
        return;
      }
      if (ev.keyCode === ESC_KEY) {
        if ($scope.fullscreen) {
          $scope.exitFullscreen();
        }
        clearScreen();
      }
    });

    function clearScreen() {
      $scope.$apply(function() {
        $scope.closeCloneControls();
        $scope.$broadcast('closeTabs');
        $scope.showDashboardSettings = false;
        $scope.showPermalink = false;
      });
    }

    $document.on('click', function(ev) {
      // If the following selectors aren't in the event.target's ancestor chain,
      // clear open menus from the screen.
      if (!$(ev.target).closest('expression, .graph_config_menu, .legend_string_container, .graph_control_tabbar, #global_controls, .add_widget_button, .modal_container').length) {
        clearScreen();
      }
    });
  }

  var sharedGraphBehavior = function($scope, config) {
    commonSetup($scope, config);
  };

  return sharedGraphBehavior;
}]);

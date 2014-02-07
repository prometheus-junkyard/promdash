angular.module("Prometheus.controllers").controller('DashboardCtrl',["$scope", "$window", "$http", "$timeout", "$document", "WidgetHeightCalculator", "UrlConfigDecoder", "UrlConfigEncoder", "UrlVariablesDecoder", "ThemeManager", function($scope, $window, $http, $timeout, $document, WidgetHeightCalculator, UrlConfigDecoder, UrlConfigEncoder, UrlVariablesDecoder, ThemeManager) {
  $window.onresize = function() {
    $scope.$broadcast('redrawGraphs');
  }

  $window.onbeforeunload = function() {
    var message = 'You have some unsaved changes!';
    if (unsavedChangesCheck($scope.widgets, originalWidgets) ||
          unsavedChangesCheck($scope.globalConfig, originalConfig)) {
      return message;
    }
  }

  function unsavedChangesCheck(currentObj, originalObj) {
    return angular.toJson(angular.copy(currentObj)) !== angular.toJson(originalObj);
  }

  $scope.globalConfig = dashboardData.globalConfig || {
    numColumns: 2,
    aspectRatio: 0.75,
    theme: "light_theme",
    endTime: null,
    vars: {}
  };

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

  $scope.aspectRatios = [
    {value: 0.75,    fraction: "4:3"},
    {value: 0.5625,  fraction: "16:9"},
    {value: 0.625,   fraction: "16:10"},
    {value: (1/2.4), fraction: "2.40:1"},
  ];

  $scope.themes = [
    {css: "light_theme", name: "Light"},
    {css: "dark_theme", name: "Dark"}
  ];

  $scope.themeChange = function() {
    ThemeManager.setTheme($scope.globalConfig.theme);
  };
  $scope.themeChange();

  $scope.frameHeight = function() {
    return {
      height: WidgetHeightCalculator(angular.element(".js_widget_wrapper")[0], $scope.globalConfig.aspectRatio)
    }
  }

  $scope.widgets = dashboardData.widgets || [];
  var originalWidgets = angular.copy($scope.widgets);
  var originalConfig = angular.copy($scope.globalConfig);

  $scope.vars = [];
  $scope.servers = servers;
  $scope.fullscreen = false;
  $scope.saving = false;
  $scope.showGridSettings = false;
  $scope.sortableOptions = {
    handle: ".widget_title",
  };

  $http.get('/servers.json')
    .success(function(data, status) {
      $scope.servers = data;
    })
    .error(function(data, status) {
      alert('Error fetching list of configured servers.');
    });

  $scope.saveDashboard = function() {
    $scope.saving = true;
    $http.put(window.location.pathname + '.json', {
      'dashboard': {
        'dashboard_json': angular.toJson({
          'globalConfig': $scope.globalConfig,
          'widgets': $scope.widgets
        })
      }
    }).error(function(data, status) {
      alert("Error saving dashboard.");
    }).success(function() {
      originalConfig = angular.copy($scope.globalConfig);
      originalWidgets = angular.copy($scope.widgets);
    }).finally(function() {
      $scope.saving = false;
    });
  }

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

  $scope.enableFullscreen = function() {
    $scope.fullscreen = true;
    $scope.nextCycleRedraw();
  };

  $scope.exitFullscreen = function() {
    $scope.$apply(function() {
      $scope.fullscreen = false;
    });
  };

  $document.keydown(function(ev) {
    if (ev.keyCode === 27) { // Escape keycode
      $scope.exitFullscreen();
      $scope.redrawGraphs();
    }
  });

  $scope.toggleGridSettings = function(tab) {
    $scope.showGridSettings
    if ($scope.showGridSettings == tab) {
      $scope.showTab = null;
    } else {
      $scope.showTab = tab;
    }
  };

  $scope.nextCycleRedraw = function() {
    $timeout(function() { $scope.redrawGraphs(); }, 0);
  }

  $scope.columnClass = function() {
    var colMap = {
      1: 12,
      2: 6,
      3: 4,
      4: 3,
      5: 2,
      6: 1
    };
    return 'col-lg-' + colMap[$scope.globalConfig.numColumns];
  };

  $scope.addVariable = function(name, value) {
    $scope.vars.push({name: name, value: value});
  };

  $scope.removeVariable = function(idx) {
    $scope.vars.splice(idx, 1);
  };

  $scope.$on('removeWidget', function(ev, index) {
    $scope.widgets.splice(index, 1);
  });

  $scope.addGraph = function() {
    $scope.widgets.push(Prometheus.Graph.getGraphDefaults());
  };

  $scope.addFrame = function() {
    var url = prompt("Please enter the URL for the frame to display", "http://");
    $scope.widgets.push({
      type: "frame",
      title: '',
      url: url
    });
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

  $scope.$watch('vars', function() {
    var vars = {};
    for (var i = 0; i < $scope.vars.length; i++) {
      var name = $scope.vars[i].name || '';
      var value = $scope.vars[i].value || '';

      vars[name] = value;
    }
    $scope.globalConfig.vars = vars;
  }, true);

  $scope.$watch('globalConfig', function() {
    if ($scope.globalConfig.keepUrlUpdated) {
      UrlConfigEncoder({globalConfig: $scope.globalConfig});
    }
  }, true);

  for (var o in $scope.globalConfig.vars) {
    $scope.addVariable(o, $scope.globalConfig.vars[o]);
  }

  if ($scope.widgets.length == 0) {
    $scope.addGraph();
  }
}]);

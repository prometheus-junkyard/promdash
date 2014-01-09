angular.module("Prometheus.controllers").controller('DashboardCtrl', function($scope, $window, $http, $timeout, $document, WidgetHeightCalculator) {
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
    endTime: null
  };

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
    $scope.$emit("themeChange", $scope.globalConfig.theme);
  };

  $scope.frameHeight = function() {
    return {
      height: WidgetHeightCalculator(angular.element(".js_widget_wrapper")[0], $scope.globalConfig.aspectRatio)
    }
  }

  $scope.widgets = dashboardData.widgets || [];
  var originalWidgets = angular.copy($scope.widgets);
  var originalConfig = angular.copy($scope.globalConfig);

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
    }).always(function() {
      $scope.saving = false;
    });
  }

  $scope.increaseRange = function() {
    $scope.globalConfig.range = Prometheus.Graph.nextLongerRange($scope.globalConfig.range);
    $scope.$broadcast('setRange', $scope.globalConfig.range);
  };

  $scope.decreaseRange = function() {
    $scope.globalConfig.range = Prometheus.Graph.nextShorterRange($scope.globalConfig.range);
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
    var elem = $(".fullerscreen")[0];
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullScreen();
    } else {
      $scope.fullscreen = true;
    }
    fullscreenRedraw()
  };

  $scope.exitFullscreen = function() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    fullscreenRedraw()
    $scope.$apply(function() {
      $scope.fullscreen = false;
    });
  };

  function fullscreenRedraw() {
    $timeout(function() { $scope.redrawGraphs(); }, 500);
  }

  $document.keydown(function(ev) {
    if (ev.keyCode === 32) { // Space keycode
      $scope.exitFullscreen();
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

  if ($scope.widgets.length == 0) {
    $scope.addGraph();
  }
});


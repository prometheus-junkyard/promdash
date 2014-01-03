angular.module("Prometheus.controllers").controller('DashboardCtrl', function($scope, $window, $http, $timeout, $document) {
  $window.onbeforeunload = function() {
    var message = 'You have some unsaved changes!';
    var unsavedChanges = angular.toJson(angular.copy($scope.widgets)) !== angular.toJson(originalWidgets);
    if (unsavedChanges) {
      return message;
    }
  }
  $scope.globalConfig = dashboardData.globalConfig || {
    numColumns: 2,
    endTime: null
  };
  $scope.widgets = dashboardData.widgets || [];
  var originalWidgets = angular.copy($scope.widgets);
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
    $scope.fullscreen = true;
    $timeout(function() { $scope.redrawGraphs(); }, 0);
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

  $scope.$watch('globalConfig.numColumns', function() {
    $scope.$broadcast('redrawGraphs');
  });

  $scope.$watch('globalConfig.widgetHeight', function() {
    $scope.$broadcast('redrawGraphs');
  });

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


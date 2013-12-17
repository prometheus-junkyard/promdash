angular.module("Prometheus.controllers").controller('DashboardCtrl', function($scope, $window, $http, $timeout, $document) {
  $window.onbeforeunload = function() {
    var message = 'You have some unsaved changes!';
    var unsavedChanges = angular.toJson(angular.copy($scope.graphs)) !== angular.toJson(originalGraphs);
    if (unsavedChanges) {
      return message;
    }
  }
  $scope.globalConfig = dashboardData.globalConfig || {
    numColumns: 2,
    endTime: null
  };
  $scope.graphs = dashboardData.graphs || [];
  var originalGraphs = angular.copy($scope.graphs);
  $scope.servers = servers;
  $scope.fullscreen = false;
  $scope.saving = false;
  $scope.showGridSettings = false;

  $http.get('/servers.json')
    .success(function(data, status) {
      $scope.servers = data;
    })
    .error(function(data, status) {
      alert('Error fetching list of configured servers.');
    });

  $scope.$watch('servers', function() {
    $scope.serversById = {};
    for (var i = 0; i < $scope.servers.length; i++) {
      $scope.serversById[$scope.servers[i].id] = $scope.servers[i];
    }
  });

  $scope.saveDashboard = function() {
    $scope.saving = true;
    $http.put(window.location.pathname + '.json', {
      'dashboard': {
        'graphs_json': angular.toJson({
          'globalConfig': $scope.globalConfig,
          'graphs': $scope.graphs
        })
      }
    }).error(function(data, status) {
      alert("Error saving dashboard.");
    }).success(function() {
      originalGraphs = angular.copy($scope.graphs);
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

  $scope.refreshGraphs = function() {
    $scope.$broadcast('refreshGraphs');
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

  $scope.$watch('globalConfig.graphHeight', function() {
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

  $scope.addGraph = function() {
    $scope.graphs.push(Prometheus.Graph.getGraphDefaults());
  };

  function setupRefreshTimer(delay) {
    $scope.refreshTimer = $timeout(function() {
      $scope.$broadcast('refreshGraphs');
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

  if ($scope.graphs.length == 0) {
    $scope.addGraph();
  }
});


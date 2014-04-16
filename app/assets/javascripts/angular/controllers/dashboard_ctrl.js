angular.module("Prometheus.controllers").controller('DashboardCtrl', ["$scope", "$window", "$http", "$timeout", "$document", "$location", "WidgetHeightCalculator", "UrlConfigEncoder", "SharedGraphBehavior", function($scope, $window, $http, $timeout, $document, $location, WidgetHeightCalculator, UrlConfigEncoder, SharedGraphBehavior) {
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

  $scope.fullscreen = $location.search().fullscreen;
  $scope.saving = false;
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

  SharedGraphBehavior($scope);

  $scope.frameHeight = function() {
    return {
      height: WidgetHeightCalculator(angular.element(".js_widget_wrapper")[0], $scope.globalConfig.aspectRatio)
    }
  }

  $scope.widgets = dashboardData.widgets || [];
  var originalWidgets = angular.copy($scope.widgets);
  var originalConfig = angular.copy($scope.globalConfig);

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

  $scope.removeVariable = function(idx) {
    $scope.vars.splice(idx, 1);
  };

  $scope.$on('removeWidget', function(ev, index) {
    $scope.widgets.splice(index, 1);
  });

  $scope.addFrame = function() {
    var url = prompt("Please enter the URL for the frame to display", "http://");
    $scope.widgets.push({
      type: "frame",
      title: '',
      url: url
    });
  };

  $scope.addGraph = function() {
    $scope.widgets.push(Prometheus.Graph.getGraphDefaults());
  };

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

  if ($scope.widgets.length == 0) {
    $scope.addGraph();
  }
}]);

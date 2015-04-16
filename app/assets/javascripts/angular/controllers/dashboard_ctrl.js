angular.module("Prometheus.controllers")
.controller('DashboardCtrl', ["$scope",
            "$window",
            "$http",
            "$timeout",
            "$location",
            "URLConfigEncoder",
            "URLVariablesDecoder",
            "SharedGraphBehavior",
            "InputHighlighter",
            "ModalService",
            "Palettes",
            function($scope,
                     $window,
                     $http,
                     $timeout,
                     $location,
                     URLConfigEncoder,
                     URLVariablesDecoder,
                     SharedGraphBehavior,
                     InputHighlighter,
                     ModalService,
                     Palettes) {

  $window.onresize = function() {
    $scope.$broadcast('redrawGraphs');
  };

  $scope.generatePermalink = function(event) {
    if ($scope.generatingPermalink || $scope.showPermalink) {
      $scope.showPermalink = false;
      return;
    }
    $scope.generatingPermalink = true;
    $http.post($window.location.origin + "/permalink", buildDashboardJSON()).then(function(payload) {
      $scope.showPermalink = true;
      $scope.permalink = $window.location.origin + payload.data.url;
      var input = $("[ng-model=permalink]")[0];
      InputHighlighter(input);
    }, function() {
      alert("Failed to create dashboard permalink");
    }).finally(function() {
      $scope.generatingPermalink = false;
    });
  };

  $scope.showCloneControls = false;
  $scope.fullscreen = false;
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
  $scope.dashboardNames = [];

  $scope.widgets = $scope.widgets || dashboardData.widgets || [];
  SharedGraphBehavior($scope, dashboardData.globalConfig);
  $scope.palettes = Palettes;
  $scope.globalConfig.palette = $scope.globalConfig.palette || 'colorwheel';
  $scope.globalConfig.resolution = $scope.globalConfig.resolution || 4;

  $scope.saveDashboard = function() {
    $scope.saving = true;
    $http.put($window.location.pathname + '.json', buildDashboardJSON()).error(function(data, status) {
      alert("Error saving dashboard.");
    }).finally(function() {
      $scope.saving = false;
    });
  };

  $scope.saveProfile = function() {
    $scope.saving = true;
    $http.put($window.location.pathname + '.json', buildProfileJSON()).error(function(data, status) {
      alert("Error saving dashboard.");
    }).finally(function() {
      $scope.saving = false;
    });
  };

  $scope.enableFullscreen = function() {
    $scope.fullscreen = true;
    $scope.nextCycleRedraw();
  };

  $scope.exitFullscreen = function() {
    $scope.fullscreen = false;
    $scope.nextCycleRedraw();
  };

  $scope.closeCloneControls = function() {
    ModalService.closeModal();
  };

  $scope.hideDashboardSettings = function() {
    $scope.showDashboardSettings = false;
  };

  $scope.hidePermalink = function() {
    $scope.showPermalink = false;
  };

  $scope.$on('closeModal', function() {
    $scope.showCloneControls = false;
  });

  $scope.toggleGridSettings = function(tab) {
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
      title: "",
      range: $scope.globalConfig.range,
      endTime: $scope.globalConfig.endTime,
      url: url
    });
  };

  $scope.addGraph = function() {
    $scope.widgets.push({
      title: 'Title',
      range: $scope.globalConfig.range,
      endTime: $scope.globalConfig.endTime,
      expressions: [],
      tags: [],
      type: 'graph'
    });
  };

  $scope.addPie = function() {
    var pie = {
      title: "Title",
      expression: {
        id: 0,
        serverID: ($scope.servers[0] || {}).id,
        expression: "",
        legendID: 1
      },
      type: "pie"
    };
    $scope.widgets.push(pie);
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

  $scope.$watch('globalConfig.tags', function() {
    $scope.widgets.forEach(function(w) {
      if (w.type === "graph") {
        w.tags = $scope.globalConfig.tags;
      }
    });
  }, true);

  if ($scope.widgets.length === 0) {
    $scope.addGraph();
  }

  $scope.queryDirectory = function() {
    $scope.directoryForClone.id = $scope.directoryForClone.id || "unassigned";
    $http.get('/directories/' + $scope.directoryForClone.id).then(function(payload) {
      $scope.dashboardNames = payload.data.dashboards;
      $scope.dashboardForClone = payload.data.dashboards.filter(function(d) {
        return d.name == dashboardName;
      })[0] || payload.data.dashboards[0];
      $scope.queryDashboard();
    });
  };

  $scope.queryDashboard = function() {
    $http.get('/dashboards/' + $scope.dashboardForClone.id + '/widgets').then(function(payload) {
      $scope.dashboardWidgets = payload.data.widgets;
      $scope.widgetToClone = payload.data.widgets[0];
    });
  };

  $scope.showCloneMenu = function() {
    $scope.showCloneControls = true;
    ModalService.toggleModal();
  };

  $http.get('/directories.json').then(function(payload) {
    $scope.directoryNames = payload.data.directories;
    $scope.directoryForClone = payload.data.directories.filter(function(d) {
      return d.name == directoryName;
    })[0] || payload.data.directories[0];
    $scope.queryDirectory();
  });

  $scope.copyWidget = function() {
    $scope.widgets.push(angular.copy($scope.widgetToClone));
  };

  function buildProfileJSON() {
    return {
      'variables': $scope.globalConfig.vars
    };
  }

  function buildDashboardJSON() {
    return {
      'dashboard': {
        'name': dashboardName,
        'dashboard_json': {
          'globalConfig': $scope.globalConfig,
          'widgets': $scope.widgets
        }
      }
    };
  }
}]);

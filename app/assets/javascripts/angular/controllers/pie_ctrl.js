angular.module("Prometheus.controllers").controller('PieCtrl', ["$scope",
                                                    "$http", "$window",
                                                    "$timeout",
                                                    "VariableInterpolator",
                                                    "UrlHashEncoder",
                                                    "GraphRefresher",
                                                    "ServersByIdObject",
                                                    "WidgetLinkHelper",
                                                    "ModalService",
                                                    "CheckWidgetMenuAlignment",
                                                    "YAxisUtilities",
                                                    function($scope, $http,
                                                             $window, $timeout,
                                                             VariableInterpolator,
                                                             UrlHashEncoder,
                                                             GraphRefresher,
                                                             ServersByIdObject,
                                                             WidgetLinkHelper,
                                                             ModalService,
                                                             CheckWidgetMenuAlignment,
                                                             YAxisUtilities) {
  $scope.generateWidgetLink = function(event) {
    if ($scope.showTab !== 'staticlink') {
      return;
    }
    var graphBlob = {};
    graphBlob.widget = $scope.graph;
    graphBlob.globalConfig = dashboardData.globalConfig;
    WidgetLinkHelper
      .createLink({
         encoded_url: UrlHashEncoder(graphBlob),
         graph_title: $scope.graph.title,
         dashboard_name: dashboardName
       }, event)
      .setLink($scope)
      .highlightInput(event);
  };

  // TODO: Set these on graph creation so we don't have to keep doing these
  // checks
  $scope.graph.legendSetting = $scope.graph.legendSetting || "sometimes";
  $scope.graph.legendFormatStrings = $scope.graph.legendFormatStrings || [
    {id: 1, name: ""}
  ];
  $scope.graph.interpolationMethod = $scope.graph.interpolationMethod || "cardinal";
  $scope.serversById = ServersByIdObject($scope.servers);
  $scope.data = null;

  if (!Object.keys($scope.graph.expression).length){
    var serverId = 0;
    var id = 0;
    if ($scope.servers.length != 0) {
      serverId = $scope.servers[0]['id'];
    }

    $scope.graph.expression = {
      'id': id,
      'server_id': serverId,
      'expression': ''
    };
  }

  $scope.removeGraph = function() {
    $scope.$emit('removeWidget', $scope.index);
    $scope.closeGraphDelete();
  };

  $scope.toggleTab = function(tab) {
    $scope.showTab = $scope.showTab == tab ? null : tab;
    if ($scope.showTab) {
      $timeout(CheckWidgetMenuAlignment(tab), 0);
    }
  };

  $scope.$on('setRange', function(ev, range) {
    $scope.graph.range = range;
    $scope.refreshGraph();
  });

  $scope.$on('setEndTime', function(ev, endTime) {
    $scope.graph.endTime = endTime;
    $scope.refreshGraph();
  });

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshGraph();
  });

  $scope.$on('closeModal', function() {
    $scope.showGraphDelete = false;
  });

  $scope.closeGraphDelete = function() {
    ModalService.closeModal();
  };

  $scope.graphDeleteModal = function() {
    ModalService.toggleModal();
    $scope.showGraphDelete = true;
  };

  $scope.title = function() {
    return VariableInterpolator($scope.graph.title, $scope.vars);
  };

  $scope.addLegendString = function() {
    var lsts = $scope.graph.legendFormatStrings;
    var id = (new Date).getTime().toString(16);
    lsts.push({id: id, name: ""});
  };

  $scope.removeLegendString = function(index) {
    $scope.graph.legendFormatStrings.splice(index, 1);
  };

  $scope.disableYMaxSibling = YAxisUtilities.disableYMaxSibling;
  $scope.checkValidNumber = YAxisUtilities.checkValidNumber;

  // Query for the data.
  $scope.refreshGraph = function() {
    var exp = $scope.graph.expression;
    var server = $scope.serversById[exp['server_id'] || 1];
    $http.get(server.url + "api/query", {
      params: {
        expr: exp.expression
      }
    }).then(function(payload) {
      // success
      $scope.data = payload.data;
    }, function() {
      // failure
    });
  };
  $scope.refreshGraph();

  if (location.pathname.match(/^\/w\//)) { // On a widget page.
    $scope.widgetPage = true;
    $scope.dashboard = dashboard;
  }
}]);

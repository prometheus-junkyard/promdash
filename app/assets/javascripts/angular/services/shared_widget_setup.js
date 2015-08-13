angular.module("Prometheus.services").factory('SharedWidgetSetup',
                                              ["$timeout",
                                                "VariableInterpolator",
                                                "ServersByIDObject",
                                                "ModalService",
                                                "WidgetLinkHelper",
                                                "URLHashEncoder",
                                                "CheckWidgetMenuAlignment",
                                                "WidgetTabService",
                                                function($timeout,
                                                         VariableInterpolator,
                                                         ServersByIDObject,
                                                         ModalService,
                                                         WidgetLinkHelper,
                                                         URLHashEncoder,
                                                         CheckWidgetMenuAlignment,
                                                         WidgetTabService) {

return function($scope) {
  $scope.generateWidgetLink = function(event) {
    if ($scope.showTab !== 'staticlink') {
      return;
    }
    var graphBlob = {};
    graphBlob.widget = $scope.graph;
    graphBlob.globalConfig = dashboardData.globalConfig;
    WidgetLinkHelper
      .createLink({
         encoded_url: URLHashEncoder(graphBlob),
         graph_title: $scope.graph.title,
         dashboard_name: dashboardName
       }, event)
      .setLink($scope)
      .highlightInput(event);
  };
  $scope.serversById = ServersByIDObject($scope.servers);

  if ($scope.graph.type !== "gauge") {
    $scope.graph.showLegend = $scope.graph.showLegend || "sometimes";
  }

  $scope.graph.legendFormatStrings = $scope.graph.legendFormatStrings || [
    {id: 1, name: ""}
  ];

  $scope.addLegendString = function() {
    var lsts = $scope.graph.legendFormatStrings;
    var id = (new Date()).getTime().toString(16);
    lsts.push({id: id, name: ""});
  };

  $scope.removeLegendString = function(index) {
    $scope.graph.legendFormatStrings.splice(index, 1);
  };


  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshGraph();
  });

  $scope.title = function() {
    return VariableInterpolator($scope.graph.title, $scope.vars);
  };

  $scope.$on('removeExpression', function(ev, index) {
    $scope.graph.expressions.splice(index, 1);
  });

  $scope.addExpression = function() {
    var serverID = 0;
    var axisID = 0;
    var id = 0;
    if ($scope.graph.expressions.length !== 0) {
      var prev = $scope.graph.expressions[$scope.graph.expressions.length-1];
      id = prev.id + 1;
      serverID = prev.serverID;
      axisID = prev.axisID;
    } else if ($scope.servers.length !== 0) {
      serverID = $scope.servers[0].id;
      axisID = ($scope.graph.axes || [{}])[0].id;
    }

    var exp = {
      id: id,
      serverID: serverID,
      expression: ''
    };
    if ($scope.graph.type === "graph") {
      exp.axisID = axisID;
    }
    $scope.graph.expressions.push(exp);
  };

  WidgetTabService($scope);
};
}]);

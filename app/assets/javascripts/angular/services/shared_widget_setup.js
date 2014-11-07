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
  $scope.graph.showLegend = $scope.graph.showLegend || "sometimes";

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshGraph();
  });

  $scope.title = function() {
    return VariableInterpolator($scope.graph.title, $scope.vars);
  };

  WidgetTabService($scope);
}
}]);

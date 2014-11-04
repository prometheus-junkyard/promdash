angular.module("Prometheus.services").factory('SharedWidgetSetup',
                                              ["$timeout",
                                                "VariableInterpolator",
                                                "ServersByIdObject",
                                                "ModalService",
                                                "WidgetLinkHelper",
                                                "UrlHashEncoder",
                                                "CheckWidgetMenuAlignment",
                                                "WidgetTabService",
                                                function($timeout,
                                                         VariableInterpolator,
                                                         ServersByIdObject,
                                                         ModalService,
                                                         WidgetLinkHelper,
                                                         UrlHashEncoder,
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
         encoded_url: UrlHashEncoder(graphBlob),
         graph_title: $scope.graph.title,
         dashboard_name: dashboardName
       }, event)
      .setLink($scope)
      .highlightInput(event);
  };
  $scope.serversById = ServersByIdObject($scope.servers);
  $scope.graph.legendSetting = $scope.graph.legendSetting || "sometimes";

  $scope.$on('refreshDashboard', function(ev) {
    $scope.refreshGraph();
  });

  $scope.title = function() {
    return VariableInterpolator($scope.graph.title, $scope.vars);
  };

  WidgetTabService($scope);
}
}]);

angular.module("Prometheus.services").factory('WidgetTabService', ["$timeout", "CheckWidgetMenuAlignment", function($timeout, CheckWidgetMenuAlignment) {
  return function(scope) {
    scope.toggleTab = function(ev, tab) {
      scope.showTab = scope.showTab == tab ? null : tab;
      $timeout(CheckWidgetMenuAlignment(ev.currentTarget, tab), 0);
    };

    scope.$on('closeTabs', function() {
      scope.showTab = null;
    });
  };
}]);

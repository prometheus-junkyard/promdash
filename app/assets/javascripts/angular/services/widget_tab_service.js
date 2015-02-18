angular.module("Prometheus.services").factory('WidgetTabService', ["$timeout", "CheckWidgetMenuAlignment", function($timeout, CheckWidgetMenuAlignment) {
  return function(scope) {
    scope.toggleTab = function(ev, tab) {
      scope.showTab = scope.showTab == tab ? null : tab;
      $(ev.currentTarget).closest('.graph_config_menu').find('.btn_active').removeClass('btn_active');
      if (scope.showTab) {
        $(ev.currentTarget).addClass('btn_active');
      }
      $timeout(CheckWidgetMenuAlignment(ev.currentTarget, tab), 0);
    };

    scope.closeTab = function(ev) {
      var w = $(ev.currentTarget).closest('.graph_control_tabbar').siblings('.js_widget_wrapper');
      w.find('.btn_active').removeClass('btn_active');
      scope.showTab = null;
    };

    scope.$on('closeTabs', function() {
      $('.btn_active').removeClass('btn_active');
      scope.showTab = null;
    });
  };
}]);

angular.module("Prometheus.services").factory("CheckWidgetMenuAlignment", function() {
  return function(tab) {
    return function() {
      // Check element position and add the right aligning class if needed.
      var $el = $("[ng-show=\"showTab == '" + tab + "'\"]");
      var rect = $el[0].getBoundingClientRect();

      if (rect.left < 0) {
        $el.addClass("alignLeft");
        $el.closest(".graph_control_tabbar").addClass("alignLeft");
      } else {
        $el.removeClass("alignLeft");
        $el.closest(".graph_control_tabbar").removeClass("alignLeft");
      }
    }
  }
});

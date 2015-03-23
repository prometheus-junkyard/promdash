angular.module("Prometheus.services").factory('HTMLEscaper', ["$timeout", function($timeout) {
  return function(input) {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };

    return input.replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  };
}]);

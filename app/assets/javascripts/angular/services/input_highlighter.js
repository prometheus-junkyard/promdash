angular.module("Prometheus.services").factory('InputHighlighter', ["$timeout", function($timeout) {
  return function(input) {
    $timeout(function() {
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }, 0);
  };
}]);

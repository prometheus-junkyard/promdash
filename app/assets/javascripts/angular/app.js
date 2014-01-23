angular.module("Prometheus.controllers", []);
angular.module("Prometheus.directives", []);
angular.module("Prometheus.resources", []);
angular.module("Prometheus.services", []);

angular.module("Prometheus",
  ["ui.sortable", "ui.bootstrap", "Prometheus.controllers", "Prometheus.directives", "Prometheus.resources", "Prometheus.services"])
.run(['$rootScope', function($rootScope) {
  // adds some basic utilities to the $rootScope for debugging purposes
  $rootScope.log = function(thing) {
    console.log(thing);
  };

  $rootScope.alert = function(thing) {
    alert(thing);
  };
}]);

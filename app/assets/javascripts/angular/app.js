angular.module("Prometheus.controllers", []);
angular.module("Prometheus.directives", []);
angular.module("Prometheus.resources", []);
angular.module("Prometheus.services", []);
angular.module("Prometheus.filters", []);

angular.module("Prometheus",
  ["ui.sortable", "ui.bootstrap", "ui.slider", "Prometheus.controllers", "Prometheus.directives", "Prometheus.resources", "Prometheus.services", "Prometheus.filters"])
.run(['$rootScope', '$location', function($rootScope, $location) {
  // adds some basic utilities to the $rootScope for debugging purposes
  $rootScope.log = function(thing) {
    console.log(thing);
  };

  $rootScope.alert = function(thing) {
    alert(thing);
  };

  if ($location.hash()[0] === "?") {
    $location.url($location.path() + $location.hash());
  }
}]).config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true);
}]);

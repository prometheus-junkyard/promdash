var services = angular.module("Prometheus.services")
var $injector = angular.injector([ 'Prometheus.services' ]);

function getService(serviceName) {
  return $injector.get(serviceName)
}

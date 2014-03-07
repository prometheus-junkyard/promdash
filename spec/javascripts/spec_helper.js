var $injector = angular.injector([ 'Prometheus.services' ]);

function getService(serviceName) {
  return $injector.get(serviceName)
}

function createElement(tagName) {
  return document.createElement(tagName);
}

angular.module("Prometheus.services").factory('URLGenerator', [function() {
  return function(url, path) {
    var a = document.createElement('a');
    a.href = url;
    a.pathname = a.pathname.replace(/\/?$/, path);
    return a.href;
  };
}]);

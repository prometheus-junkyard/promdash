angular.module("Prometheus.services").factory('URLGenerator', ["VariableInterpolator", function
(VariableInterpolator) {
  return function(url, path, vars) {
    url = VariableInterpolator(url, vars)
    var a = document.createElement('a');
    a.href = url;
    a.pathname = a.pathname.replace(/\/?$/, path);
    return a.href;
  };
}]);

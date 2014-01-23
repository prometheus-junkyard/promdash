angular.module("Prometheus.services").factory('VariableInterpolator', function() {
  var re = /{{\w+}}/g;

  return function(str, varValues) {
    var vars = str.match(re);
    if (!vars) {
      return str;
    }

    for (var i = 0; i < vars.length; i++) {
      str = str.replace(vars[i], varValues[vars[i].replace(/{|}/g, '')]);
    }
    return str;
  };
});

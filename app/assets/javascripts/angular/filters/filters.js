angular.module("Prometheus.filters").filter('toPercent', function() {
  return function(input) {
    return parseFloat(input, 10) * 100 + "%";
  }
});

angular.module("Prometheus.filters").filter('toPercentile', function() {
  return function(input) {
    return parseFloat(input, 10) * 100 + "th";
  }
});

angular.module("Prometheus.filters").filter('hostnameFqdn', function() {
  return function(input) {
    var a = document.createElement("a");
    a.href = input;
    return a.host;
  }
});

angular.module("Prometheus.filters").filter('hostname', function() {
  return function(input) {
    var a = document.createElement("a");
    a.href = input;
    return a.host.split(".", 1)[0];
  }
});

angular.module("Prometheus.filters").filter('regex', function() {
  return function(input, regex, replace) {
    return input.replace(new RegExp(regex, "g"), replace);
  }
});

angular.module("Prometheus.filters").filter('toPercent', function() {
  return function(input) {
    return parseFloat(input, 10) * 100 + "%";
  };
});

angular.module("Prometheus.filters").filter('toPercentile', function() {
  return function(input) {
    return parseFloat(input, 10) * 100 + "th";
  };
});

angular.module("Prometheus.filters").filter('hostnameFqdn', function() {
  return function(input) {
    var re = /^([^:\/?]+:\/\/(www\.)?)?([^\/]+)/;
    var match = input.match(re);
    if (match && match[3]) {
      return match[3].replace('www.', '').replace(/:[0-9]+/,'');
    }
    return '';
  };
});

angular.module("Prometheus.filters").filter('hostname', ['$filter', function($filter) {
  return function(input) {
    return $filter('hostnameFqdn')(input).split('.')[0];
  };
}]);

angular.module("Prometheus.filters").filter('regex', function() {
  return function(input, regex, replace) {
    return input.replace(new RegExp(regex, "g"), replace);
  };
});

angular.module("Prometheus.filters").filter('toLowerCase', function() {
  return function(input) {
    return input.toLowerCase();
  };
});

angular.module("Prometheus.filters").filter('toUpperCase', function() {
  return function(input) {
    return input.toUpperCase();
  };
});

angular.module("Prometheus.services").factory('ServersByIDObject', function() {
  return function(servers) {
    var serversById = {};
    for (var i = 0; i < servers.length; i++) {
      serversById[servers[i].id] = servers[i];
    }
    return serversById;
  };
});

angular.module("Prometheus.services").factory('FullScreenAspectRatio', function() {
  return function() {
    // Graph title height is currently static, hence the magic 46.
    var aspectRatio = (window.innerHeight - 46) / window.innerWidth;
    return aspectRatio;
  };
});

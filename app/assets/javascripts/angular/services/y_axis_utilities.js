angular.module("Prometheus.services").factory('YAxisUtilities', function() {
  var logScale, linearScale;
  return {
    setLogScale: function(min, max) {
      return logScale = d3.scale.log().domain([min, max]);
    },
    setLinearScale: function(min, max) {
      if (!logScale) {
        throw("Must set logScale first!");
      }
      return linearScale = d3.scale.linear().domain([min, max]).range(logScale.range());
    },
    getScale: function(scale) {
      return scale === "log" ? logScale : linearScale;
    },
    getTickFormat: function(format) {
      return format === "kmbt" ? Rickshaw.Fixtures.Number.formatKMBT : null;
    }
  };
});

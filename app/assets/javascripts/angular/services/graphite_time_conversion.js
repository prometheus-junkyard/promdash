angular.module("Prometheus.services").factory('GraphiteTimeConverter', function() {
  // Converts a Javascript timestamp (milliseconds since the epoch) to an
  // absolute time string compatible with Graphite.
  // See http://graphite.readthedocs.org/en/latest/render_api.html
  function timestampToGraphiteTime(timestamp) {
    function pad(number) {
      return number < 10 ? '0' + number : number;
    }

    var d = new Date(timestamp);
    return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + '_' + d.getUTCFullYear() + '' + pad(d.getUTCMonth() + 1) + '' + pad(d.getUTCDate());
  }

  return {
    graphiteFrom: function(range, endTime) {
      var rangeSeconds = Prometheus.Graph.parseDuration(range);
      if (endTime === null || endTime === undefined) {
        return '-' + rangeSeconds + 'seconds';
      } else {
        return timestampToGraphiteTime(endTime - (rangeSeconds * 1000));
      }
    },

    convert: function(time) {
      if (time === null || time === undefined) {
        return 'now';
      } else {
        return timestampToGraphiteTime(time);
      }
    }
  };
});

var Prometheus = Prometheus || {},
    dashboardData = dashboardData || {},
    servers;

Prometheus.Graph = {
  rangeSteps: [
    '1s', '10s', '1m', '5m', '15m', '30m', '1h', '2h', '6h', '12h', '1d', '2d',
    '1w', '2w', '4w', '8w', '1y', '2y'
  ],

  timeFactors: {
    'y': 60 * 60 * 24 * 365,
    'w': 60 * 60 * 24 * 7,
    'd': 60 * 60 * 24,
    'h': 60 * 60,
    'm': 60,
    's': 1
  },

  parseDuration: function(durationText) {
    if (!durationText) {
      return 60;
    }
    var rangeRE = new RegExp('^([0-9]+)([ywdhms]+)$');
    var matches = durationText.match(rangeRE);
    if (!matches) { return };
    if (matches.length != 3) {
      return 60;
    }
    var value = parseInt(matches[1]);
    var unit = matches[2];
    return value * Prometheus.Graph.timeFactors[unit];
  },

  nextLongerRange: function(currentRange) {
    if (!currentRange) {
      return '1h';
    }
    var rangeSeconds = Prometheus.Graph.parseDuration(currentRange);
    for (var i = 0; i < Prometheus.Graph.rangeSteps.length; i++) {
      if (rangeSeconds < Prometheus.Graph.parseDuration(Prometheus.Graph.rangeSteps[i])) {
        return Prometheus.Graph.rangeSteps[i];
      }
    }
    return currentRange;
  },

  nextShorterRange: function(currentRange) {
    if (!currentRange) {
      return '1h';
    }
    var rangeSeconds = Prometheus.Graph.parseDuration(currentRange);
    for (var i = Prometheus.Graph.rangeSteps.length - 1; i >= 0; i--) {
      if (rangeSeconds > Prometheus.Graph.parseDuration(Prometheus.Graph.rangeSteps[i])) {
        return Prometheus.Graph.rangeSteps[i];
      }
    }
    return currentRange;
  },

  earlierEndTime: function(timestamp, rangeText) {
    var range = Prometheus.Graph.parseDuration(rangeText);
    var date = timestamp ? new Date(timestamp) : new Date();
    return Math.floor(date.getTime() - (range * 1000 / 2));
  },

  laterEndTime: function(timestamp, rangeText) {
    var range = Prometheus.Graph.parseDuration(rangeText);
    var date = timestamp ? new Date(timestamp) : new Date();
    return Math.floor(date.getTime() + (range * 1000 / 2));
  },

  getGraphDefaults: function() {
    return {
      title: 'Title',
      stacked: false,
      range: '1h',
      endTime: null,
      expressions: [],
      type: "graph"
    };
  },

  getAxisDefaults: function() {
    return {
      orientation: 'left',
      renderer: 'line',
      scale: 'linear',
      format: 'kmbt'
    };
  }
};

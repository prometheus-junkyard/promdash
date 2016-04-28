angular.module("Prometheus.services").factory('RickshawDataTransformer', [function() {
  function parseValue(value) {
    if (value == "NaN" || value == "Inf" || value == "-Inf") {
      // Show special float values as gaps, since there's no better way to
      // display them.
      return null;
    } else {
      return parseFloat(value);
    }
  }

  function metricToTsName(labels) {
    var tsName = (labels.__name__ || '') + "{";
    var labelStrings = [];
    for (var label in labels) {
      if (label != "__name__") {
        labelStrings.push(label + "=\"" + labels[label] + "\"");
      }
    }
    tsName += labelStrings.join(",") + "}";
    return tsName;
  }

  return function(data, axisIDByExprID) {
    var series = [];
    if (!data) {
      return;
    }

    series = series.concat(data.data.map(function(ts) {
      var name = metricToTsName(ts.metric);
      return {
        name: name,
        // uniqName is added to be kept as a unique, unmodified identifier for a series.
        uniqName: name,
        type: data.type,
        axisID: axisIDByExprID[data.expID],
        expID: data.expID,
        labels: ts.metric,
        data: ts.values.map(function(value) {
          return {
            x: value[0],
            y: parseValue(value[1])
          };
        })
      };
    }));

    return series;
  };
}]);

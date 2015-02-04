angular.module("Prometheus.services").factory('RickshawDataTransformer', [function() {
  function parseValue(value) {
    if (value == "NaN" || value == "Inf" || value == "-Inf") {
      return 0; // TODO: what should we really do here?
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
    for (var i = 0; i < data.length; i++) {
      if (!data[i]) {
        continue;
      }

      series = series.concat((data[i].data.Value || data[i].data.value).map(function(ts) {
        var name = metricToTsName(ts.Metric || ts.metric);
        return {
          name: name,
          // uniqName is added to be kept as a unique, unmodified identifier for a series.
          uniqName: name,
          axisID: axisIDByExprID[data[i].exp_id],
          exp_id: data[i].exp_id,
          labels: ts.Metric || ts.metric,
          data: (ts.Values || ts.values).map(function(value) {
            return {
              x: value.Timestamp || value[0],
              y: parseValue(value.Value || value[1])
            };
          })
        };
      }));
    }

    series = new Rickshaw.Series(series);
    return series;
  };
}]);

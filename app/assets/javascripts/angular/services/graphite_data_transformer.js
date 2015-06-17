angular.module("Prometheus.services").factory('GraphiteDataTransformer', [function() {
  function makeData(ts, axisIDByExprID) {
    var name = "{target: \"" + ts.data.target + "\"}";
    return {
      name: name,
      // uniqName is added to be kept as a unique, unmodified identifier for a series.
      uniqName: name,
      type: ts.type,
      axisID: axisIDByExprID[ts.expID],
      expID: ts.expID,
      labels: {target:ts.data.target},
      data: (ts.data.datapoints).map(function(value) {
        return {
          x: value[1],
          y: value[0]
        };
      })
    };
  }

  return function(ts, axisIDByExprID) {
    return makeData(ts, axisIDByExprID);
  };
}]);

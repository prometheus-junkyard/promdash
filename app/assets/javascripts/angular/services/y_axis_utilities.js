angular.module("Prometheus.services").factory('YAxisUtilities', [function() {
  var logScale, linearScale;
  // Extends a D3 scale to ignore "null" values.
  function extendScale(scale) {
    var extendedScale = function(y) {
      if (y === null) {
        return null;
      }
      return scale(y);
    };
    extendedScale.__proto__ = scale;
    return extendedScale;
  }
  return {
    setLogScale: function(min, max) {
      logScale = extendScale(d3.scale.log().domain([1, max]));
      return logScale;
    },
    setLinearScale: function(min, max) {
      if (!logScale) {
        throw("Must set logScale first!");
      }
      linearScale = extendScale(d3.scale.linear().domain([min, max]).range(logScale.range()));
      return linearScale;
    },
    getScale: function(scale) {
      return scale === "log" ? logScale : linearScale;
    },
    getTickFormat: function(format) {
      switch (format) {
      case "kmbt":
        return Rickshaw.Fixtures.Number.formatKMBT;
      case "kmgtp1024":
        return function(y) {
          var n = Rickshaw.Fixtures.Number.formatBase1024KMGTP(y);
          if (n && typeof n === "string") {
            var s = n.slice(n.length - 1);
            // Trim trailing digits from default return values.
            return parseFloat(n).toFixed(2) + s;
          } else {
            return n;
          }
        };
      default:
        return null;
      }
    },
    checkValidNumber: function(event) {
      var el = event.currentTarget;
      var inputSplit = el.value.split("=");
      var maybeCond = inputSplit[0];
      var maybeValue = parseFloat(maybeCond, 10);
      var val = parseFloat(inputSplit[1], 10);
      if (maybeCond && isNaN(maybeValue) && ([">", "<"].indexOf(maybeCond) === -1 || isNaN(val))) {
        el.classList.add("invalid_input");
      } else {
        el.classList.remove("invalid_input");
      }
    },
    disableYMaxSibling: function(event) {
      var $yMaxInputs = $(event.currentTarget).closest(".widget_wrapper").find("[ng-model='axis.yMax']");
      $yMaxInputs.prop('disabled', false);
      if (!event.currentTarget.value) {
        return;
      }
      var inputs = Array.prototype.slice.call($yMaxInputs);
      var i = inputs.indexOf(event.currentTarget);
      inputs.splice(i, 1);
      $(inputs).prop('disabled', true);
    }
  };
}]);

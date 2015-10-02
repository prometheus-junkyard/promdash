angular.module("Prometheus.services").factory('DashboardVariables', [function() {
  function mergeObjectArrays(a, b) {
    var merged = [];
    for (var i in a) {
      var dup = false;
      for (var j in b)
        if (b[j].name == a[i].name) {
          dup = true;
          break;
        }
        if (!dup) {
          merged.push(a[i]);
        }
    }
    return merged.concat(b);
  }

  return {
    mergeToObjectArray: function() {
      var args = Array.prototype.slice.call(arguments);
      var a = args.shift();
      var b;
      /* jshint -W084 */
      while (b = args.shift()) {
        a = mergeObjectArrays(a, b);
      }
      /* jshint +W084 */
      return a;
    },

    cleanObjectArray: function() {
      var args = Array.prototype.slice.call(arguments);
      var a = args.shift();
      var b = this.mergeToObjectArray.apply(this, args);
      var match;
      var o = [];

      for (var i in b) {
        match = a.filter(function(obj) {
          return obj.name === b[i].name;
        })[0];
        if (match) {
          o.push($.extend({}, match));
        }
      }

      return o;
    },

    mergeToObject: function() {
      var args = Array.prototype.slice.call(arguments);
      var a;
      var o = {};
      /* jshint -W084 */
      while (a = args.shift()) {
        for (var i = 0; i < a.length; i++) {
          o[a[i].name] = a[i].value;
        }
      }
      /* jshint +W084 */
      return o;
    },

    sync: function(src, dst) {
      var m = this.mergeToObjectArray(src, dst);
      return this.cleanObjectArray(m, src);
    }
  };
}]);

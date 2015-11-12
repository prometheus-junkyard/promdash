angular.module("Prometheus.services").factory('Profile', function() {
  function Profile (name, variablePairs) {
    this.name = name;
    this.variablePairs = variablePairs;
  }

  return {
    new: function(name, variablePairs) {
      return new Profile(name, variablePairs);
    },

    marshal: function(profiles) {
      var o = {};

      for (var i = 0; i < profiles.length; i++) {
        var p = profiles[i];
        o[p.name] = p.variablePairs;
      }

      return o;
    },

    unmarshal: function(jsonProfiles) {
      var a = [];

      for (var name in jsonProfiles) {
        var variablePairs = jsonProfiles[name];
        var p = new Profile(name, variablePairs);
        a.push(p);
      }

      return a;
    }
  };
});

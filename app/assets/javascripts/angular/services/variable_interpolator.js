angular.module("Prometheus.services").factory('VariableInterpolator', ["$rootScope", function($rootScope) {
  // Verify that the string is using interpolation.
  var hasInterpolation = /{{.+}}/g;
  // Match single interpolated values.
  var singleInterpolation = /{{\s?(\w+)\s?}}/g;
  // Match piped interpolated values.
  var pipedInterpolation = /{{\s?\w+\s?(\|\s?\w+(:('|\")?([\sa-zA-Z0-9(\[?=:!^\])]+)?('|\")?){0,}\s?){1,}}}/g;
  function knownFilters() {
    return ["regex", "toPercent", "toPercentile", "hostname"];
  }

  return function(str, varValues) {
    var vars = str.match(hasInterpolation);
    if (!vars) {
      return str;
    }
    vars = vars[0];

    // Deal with filtered variables.
    var pipedVars = vars.match(pipedInterpolation);
    var pipeObj = {};
    if (pipedVars) {
      var scope = $rootScope.$new(true);
      pipedVars.forEach(function(v) { pipeObj[v] = null; });
      pipedVars.forEach(function(match) {
        var rep = match.replace(/\s+/g, '').replace(/{|}/g, '').split("|");

        // Set on scope so we can $eval.
        scope[rep[0]] = varValues[rep[0]]
        // Check to see if rep[1] is in the list of known filters.
        if (knownFilters().indexOf(rep[1].split(":")[0]) > -1) {
          var result;
          try {
            result = scope.$eval(rep.join("|"));
          } catch (e) {
            // Result will get displayed as undefined.
          }
          pipeObj[match] = result;
        }
      });
      scope.$destroy();
    }

    // Replace the filtered variables.
    for (var i in pipeObj) {
      // Need to escape any special matchers.
      var escapedSeq = i.replace(/([.*+?^=!:$()|\[\]\/\\])/g, "\\$1");
      str = str.replace(new RegExp(escapedSeq, "g"), pipeObj[i]);
    }

    // Replace the single variables.
    var singleMatches = vars.match(singleInterpolation);
    if ((singleMatches || []).length) {
      for (var i = 0; i < singleMatches.length; i++) {
        str = str.replace(singleMatches[i], varValues[singleMatches[i].replace(/{|}|\s/g, '')]);
      }
    }
    return str;
  };
}]);


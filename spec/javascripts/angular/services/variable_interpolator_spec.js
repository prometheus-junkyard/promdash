//= require spec_helper
describe('VariableInterpolator', function() {
  var variableInterpolator;
  beforeEach(inject(function(_VariableInterpolator_) {
     variableInterpolator = _VariableInterpolator_;
  }));
  beforeEach(function() {
    this.availableFields = {
      name: "field name",
      quantile: "0.75",
      server: "http://localhost:8080/metrics"
    };
  });

  it("interpolates the variables", function() {
    var formatStr = "{{name}} for {{server}}: {{quantile}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("field name for http://localhost:8080/metrics: 0.75");
  });

  it("returns the original string if nothing is interpolated", function() {
    var formatStr = "nothing interpolated";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("nothing interpolated");
  });

  it("returns undefined if the interpolated value doesn't exist", function() {
    var formatStr = "{{name}}: {{non_existent}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("field name: undefined");
  });

  it("applies the filter function", function() {
    var formatStr = "{{quantile | toPercent}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("75%");
  });

  it("filter function and single interpolation play nice", function() {
    var formatStr = "{{quantile | toPercent}} for {{server}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("75% for http://localhost:8080/metrics");
  });

  it("filter function and single interpolation play nice", function() {
    var formatStr = "{{quantile | toPercent}} for {{server | hostname}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("75% for localhost:8080");
  });
});

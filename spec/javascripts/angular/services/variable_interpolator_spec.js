//= require spec_helper
var variableInterpolator = getService('VariableInterpolator');
describe('VariableInterpolator', function() {
  beforeEach(function() {
    this.availableFields = {
      name: "field name",
      quantile: "0.75",
      server: "localhost:8080"
    };
  });

  it("interpolates the variables", function() {
    var formatStr = "{{name}} for {{server}}: {{quantile}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("field name for localhost:8080: 0.75");
  });

  it("returns the original string if nothing is interpolated", function() {
    var formatStr = "nothing interpolated";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("nothing interpolated");
  });

  it("returns undefined if the interpolated value doesn't exist", function() {
    var formatStr = "{{name}}: {{non_existent}}";
    expect(variableInterpolator(formatStr, this.availableFields)).toEqual("field name: undefined");
  });
});

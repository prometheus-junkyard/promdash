//= require spec_helper
describe('DashboardVariables', function() {
  var dv;
  beforeEach(inject(function(_DashboardVariables_) {
    dv = _DashboardVariables_;
  }));

  describe('cleanObjectArray', function() {
    it('removes objects in the first array not present in the second', function() {
      var a = [
        {name: "name", value: "value"},
        {name: "name2", value: "value2"},
        {name: "name3", value: "value3"},
      ];
      var b = [
        {name: "name4", value: "value4"},
        {name: "name5", value: "value5"},
        {name: "name6", value: "value6"},
      ];

      var c = dv.cleanObjectArray(a, b);
      expect(c.length).toEqual(0);

      var b = [
        {name: "name", value: "value4"},
        {name: "name2", value: "value5"},
        {name: "name6", value: "value6"},
      ];

      var c = dv.cleanObjectArray(a, b);
      expect(c.length).toEqual(2);
      expect(c).toEqual([
        {name: "name", value: "value"},
        {name: "name2", value: "value2"},
      ]);
    });
  });

  describe('sync', function() {
    it('removes from dst', function() {
      var a = [
        {name: "name", value: "a1"},
        {name: "name2", value: "a2"},
      ];
      var b = [
        {name: "name", value: "b1"},
        {name: "name2", value: "b2"},
        {name: "name6", value: "value6"},
      ];

      var c = dv.sync(a, b);
      expect(c).toEqual([
        {name: "name", value: "b1"},
        {name: "name2", value: "b2"},
      ]);
    });

    it('adds to dst', function() {
      var a = [
        {name: "name", value: "a1"},
        {name: "name2", value: "a2"},
        {name: "name6", value: "value6"},
      ];
      var b = [
        {name: "name", value: "b1"},
        {name: "name2", value: "b2"},
      ];

      var c = dv.sync(a, b);
      expect(c).toEqual([
        {name: "name", value: "b1"},
        {name: "name2", value: "b2"},
        {name: "name6", value: "value6"},
      ]);
    });
  });

  describe('mergeToObject', function() {
    it('merges two variables objects', function() {
      var a = [
        {name: "name", value: "value"},
        {name: "name2", value: "value2"},
        {name: "name3", value: "value3"},
      ];
      var b = [
        {name: "name4", value: "value4"},
        {name: "name5", value: "value5"},
        {name: "name6", value: "value6"},
      ];

      var mergedVars = dv.mergeToObject(a, b);
      expect(mergedVars).toEqual({
        name: "value",
        name2: "value2",
        name3: "value3",
        name4: "value4",
        name5: "value5",
        name6: "value6",
      });
    });

    it("over-writes pre-existing keys when merging", function() {
      var a = [
        {name: "name", value: "a"},
        {name: "name2", value: "a"},
        {name: "name3", value: "value3"},
      ];
      var b = [
        {name: "name", value: "b"},
        {name: "name2", value: "b"},
        {name: "name6", value: "value6"},
      ];

      var mergedVars = dv.mergeToObject(a, b);
      expect(mergedVars).toEqual({
        name: "b",
        name2: "b",
        name3: "value3",
        name6: "value6",
      });
    });

    it("over-writes pre-existing keys when merging several arrays", function() {
      var a = [
        {name: "name", value: "a"},
        {name: "name2", value: "a"},
        {name: "name3", value: "value3"},
      ];
      var b = [
        {name: "name", value: "b"},
        {name: "name2", value: "b"},
        {name: "name6", value: "value6"},
      ];
      var c = [
        {name: "name", value: "c"},
        {name: "name2", value: "c"},
        {name: "name7", value: "value7"},
      ];
      var d = [
        {name: "name", value: "d"},
        {name: "name2", value: "d"},
        {name: "name8", value: "value8"},
      ];

      var mergedVars = dv.mergeToObject(a, b, c, d);
      expect(mergedVars).toEqual({
        name: "d",
        name2: "d",
        name3: "value3",
        name6: "value6",
        name7: "value7",
        name8: "value8",
      });
    });
  });
});

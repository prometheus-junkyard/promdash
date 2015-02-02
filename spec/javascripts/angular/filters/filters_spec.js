describe('filters', function() {
  var $filter;
  beforeEach(inject(function(_$filter_) {
    $filter = _$filter_;
  }));

  it('toPercent', function() {
    var percent = $filter('toPercent');
    expect(percent(0.79)).toEqual("79%");
  });

  it('toPercentile', function() {
    var percentile = $filter('toPercentile');
    expect(percentile(0.79)).toEqual("79th");
  });

  it('hostnameFqdn', function() {
    var host = $filter('hostnameFqdn');
    expect(host('http://sub-domain.domain.com/path?search')).toEqual('sub-domain.domain.com');
  });

  it('host', function() {
    var host = $filter('hostname');
    expect(host('http://domain.com/path?search')).toEqual('domain');
  });

  describe('regex', function() {
    var regex;
    beforeEach(function() {
      regex = $filter('regex');
    });

    it('exact match', function() {
      expect(regex('important-data.generic-data', '\.generic-data', '')).toEqual('important-data');
    });

    it('special characters', function() {
      expect(regex('important-data32398', '\\d', '')).toEqual('important-data');
      expect(regex('important-data32398', '[a-zA-Z-]', '')).toEqual('32398');
    });
  });
});

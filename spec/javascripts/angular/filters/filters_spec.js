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

  describe('host', function() {
    it('with protocol', function() {
      var host = $filter('hostname');
      expect(host('http://domain.com:9090/path?search')).toEqual('domain.com:9090');
      expect(host('http://domain.com/path?search')).toEqual('domain.com');
      expect(host('ws://domain:9000/path?search')).toEqual('domain:9000');
    });

    it('without protocol', function() {
      var host = $filter('hostname');
      expect(host('domain.local:9090/path?search')).toEqual('domain.local:9090');
      expect(host('domain.local/path?search')).toEqual('domain.local');
      expect(host('domain:9000/path?search')).toEqual('domain:9000');
    });
  });

  describe('regex', function() {
    var regex;
    beforeEach(function() {
      regex = $filter('regex');
    });

    it('exact match', function() {
      expect(regex('important-data.generic-data', '.generic-data', '')).toEqual('important-data');
    });

    it('special characters', function() {
      expect(regex('important-data32398', '\\d', '')).toEqual('important-data');
      expect(regex('important-data32398', '[a-zA-Z-]', '')).toEqual('32398');
      expect(regex('some_random_stuff_SPECIAL', 'some_random_stuff_', '')).toEqual('SPECIAL');
    });
  });
});

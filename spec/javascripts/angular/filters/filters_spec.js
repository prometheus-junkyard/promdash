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
      [
        'http://sub-domain.domain.com:9090/path?search',
        'http://sub-domain.domain.com/path?search',
        'ws://sub-domain.domain.com:9000/path?search',
        'sub-domain.domain.com:9090/path?search',
        'sub-domain.domain.com/path?search',
        'sub-domain.domain.com:9000/path?search'
      ].forEach(function(url) {
        expect(host(url)).toEqual('sub-domain.domain.com');
      });
  });

  it('hostname', function() {
    var host = $filter('hostname');
    [
      'http://hostname.domain.com:9090/path?search',
      'http://hostname.domain.com/path?search',
      'ws://hostname.domain:9000/path?search',
      'hostname.domain.com:9090/path?search',
      'hostname.domain.com/path?search',
      'hostname.domain:9000/path?search'
    ].forEach(function(url) {
      expect(host(url)).toEqual('hostname');
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

  it('toLower', function() {
    var lowercase = $filter('toLower');
    expect(lowercase("TEST")).toEqual("test");
  });

  it('toUpper', function() {
    var uppercase = $filter('toUpper');
    expect(uppercase("test")).toEqual("TEST");
  });
});

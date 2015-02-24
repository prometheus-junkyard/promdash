describe('UrlConfig', function() {

  describe('URLParser', function () {
    var URLParser;

    beforeEach(inject(function(_URLParser_) {
       URLParser = _URLParser_;
    }));

    it('can parse urls without any query paramters or hash', function() {
      var url = 'http://www.soundcloud.com/some/path';
      var parsed = URLParser(url);
      expect(parsed.path).toEqual(url);
      expect(parsed.stringify()).toEqual(url);
    });

    it('can parse urls with query parameters and a hash', function() {
      var url = 'https://www.youtube.com/watch?v=deadbeef#t=1s';
      var parsed = URLParser(url);
      expect(parsed.path).toEqual('https://www.youtube.com/watch');
      expect(parsed.getQueryParams()).toEqual({
        v: 'deadbeef'
      });
      expect(parsed.hash).toEqual({
        t: '1s'
      });
      expect(parsed.stringify()).toEqual(url);
    });

    it('can treat a hash (#) as part of a query parameter', function() {
      var url = 'http://graphite-example.com/render?width=370&from=-3hours&until=-&height=250&target=color(alias(drawAsInfinite(some.event),""),"#663399")&yMinRight=0&title&hideLegend=false';
      var parsed = URLParser(url, {ignoreHash: true});
      expect(parsed.path).toEqual('http://graphite-example.com/render');
      expect(parsed.getQueryParams()).toEqual({
        width: '370',
        from: '-3hours',
        until: '-',
        height: '250',
        target: 'color(alias(drawAsInfinite(some.event),""),"#663399")',
        yMinRight: '0',
        title: '',
        hideLegend: 'false'
      });
      expect(parsed.stringify(false)).toEqual(url);
    });

    it('can add query parameters', function() {
      var url = 'http://graphite-example.com/render?width=370&from=-3hours';
      var parsed = URLParser(url);
      parsed.setQueryParam('until', '-');
      expect(parsed.getQueryParams()).toEqual({
        width: '370',
        from: '-3hours',
        until: '-'
      });
    });

    it('correctly parses a colorList', function() {
      var url = 'http://graphite-example.com/render?colorList=#38AFEB,#EB3838,#38EB38,#EB38DC';
      var parsed = URLParser(url, {ignoreHash: true});
      expect(parsed.getQueryParams()).toEqual({
        colorList: '#38AFEB,#EB3838,#38EB38,#EB38DC'
      });
    });

    it('can remove query parameters', function() {
      var url = 'http://graphite-example.com/render?width=370&from=-3hours';
      var parsed = URLParser(url);
      parsed.removeQueryParam('from');
      expect(parsed.getQueryParams()).toEqual({
        width: '370'
      });
    });

    it('can add hash parameters', function() {
      var url = 'http://graphite-example.com/render#width=370&from=-3hours';
      var parsed = URLParser(url);
      parsed.setHashParam('until', '-');
      expect(parsed.getHashParams()).toEqual({
        width: '370',
        from: '-3hours',
        until: '-'
      });
    });

    it('can remove hash parameters', function() {
      var url = 'http://graphite-example.com/render#width=370&from=-3hours';
      var parsed = URLParser(url);
      parsed.removeHashParam('from');
      expect(parsed.getHashParams()).toEqual({
        width: '370'
      });
    });

  });

});

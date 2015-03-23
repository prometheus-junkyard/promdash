//= require spec_helper
describe('HTMLEscaper', function() {
  var escaper;
  beforeEach(inject(function(_HTMLEscaper_) {
    escaper = _HTMLEscaper_;
  }));

  [
    {text: "spam & eggs", expected: "spam &amp; eggs"},
    {text: "me > you", expected: "me &gt; you"},
    {text: "me < you", expected: "me &lt; you"},
    {text: "me say 'wat' to you", expected: "me say &#39;wat&#39; to you"},
    {text: 'me say "wat" to you', expected: 'me say &quot;wat&quot; to you'},
    {text: '/ to /', expected: '&#x2F; to &#x2F;'},
  ].forEach(function(pair) {
    it('escapes the pair', function() {
      var text = escaper(pair.text);
      expect(text).toEqual(pair.expected);
    });
  });
});

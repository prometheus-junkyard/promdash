//= require spec_helper
describe('FullScreenAspectRatio', function() {
  var fullscreenAspectRatio;
  beforeEach(inject(function(_FullScreenAspectRatio_) {
     fullscreenAspectRatio = _FullScreenAspectRatio_;
  }));
  it("correctly calculates the aspect ratio", function() {
    var height = window.innerHeight - 46;
    var width = window.innerWidth;
    expect(fullscreenAspectRatio()).toEqual(height/width);
  });
});

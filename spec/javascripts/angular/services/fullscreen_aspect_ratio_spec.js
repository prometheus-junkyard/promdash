//= require spec_helper
var fullscreenAspectRatio = getService('FullScreenAspectRatio');
describe('FullScreenAspectRatio', function() {
  it("correctly calculates the aspect ratio", function() {
    var height = window.innerHeight - 46;
    var width = window.innerWidth;
    expect(fullscreenAspectRatio()).toEqual(height/width);
  });
});

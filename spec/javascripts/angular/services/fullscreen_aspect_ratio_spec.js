//= require spec_helper
var myService = getService('FullScreenAspectRatio');
describe('FullScreenAspectRatio', function() {
  it("correctly calculates the aspect ratio", function() {
    expect(myService()).toEqual(0.525);
  });
});

//= require spec_helper
var widgetHeightCalculator = getService('WidgetHeightCalculator');
describe('WidgetHeightCalculator', function() {
  beforeEach(function() {
    this.div = createElement("div");
  });
  it("correctly calculates height with default 3/4 aspect ratio", function() {
    $(this.div).css({ width: '400px' });
    expect(widgetHeightCalculator(this.div)).toEqual(300);
  });

  it("correctly calculates height with the aspect ratio given", function() {
    $(this.div).css({ width: '800px' });
    expect(widgetHeightCalculator(this.div, 5/8)).toEqual(500);
  });
});

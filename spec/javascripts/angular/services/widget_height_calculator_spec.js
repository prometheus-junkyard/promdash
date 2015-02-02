//= require spec_helper
describe('WidgetHeightCalculator', function() {
  var widgetHeightCalculator;
  beforeEach(inject(function(_WidgetHeightCalculator_) {
     widgetHeightCalculator = _WidgetHeightCalculator_;
  }));
  beforeEach(function() {
    this.div = document.createElement("div");
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

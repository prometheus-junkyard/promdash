//= require spec_helper
describe('ThemeManager', function() {
  var themeManager;
  beforeEach(inject(function(_ThemeManager_) {
    themeManager = _ThemeManager_;
  }));
  it('can change the theme', function() {
    themeManager.setTheme("new_theme")
    expect(themeManager.theme).toEqual("new_theme")
  });
});

//= require spec_helper
var themeManager = getService('ThemeManager');
describe('ThemeManager', function() {
  it('can change the theme', function() {
    themeManager.setTheme("new_theme")
    expect(themeManager.theme).toEqual("new_theme")
  });
});

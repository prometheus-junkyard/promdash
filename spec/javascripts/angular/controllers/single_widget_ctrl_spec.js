var servers = [];
var graphBlob = {};
describe('SingleWidgetCtrl', function() {
  var $controller;
  var $scope;
  var themeManager;
  var fullscreenAspectRatio;
  beforeEach(inject(function(_$controller_, $rootScope, _ThemeManager_, _FullScreenAspectRatio_){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    themeManager = _ThemeManager_;
    fullscreenAspectRatio = _FullScreenAspectRatio_;
  }));

  beforeEach(function() {
    $controller('SingleWidgetCtrl', { $scope: $scope });
  });

  it('loads correctly', function() {
    expect($scope.servers).toEqual([]);
  });

  it('sets the aspect ratio to that of the full screen', function() {
    var r = fullscreenAspectRatio();
    expect($scope.globalConfig.aspectRatio).toEqual(r);
  });

  it('sets a default theme', function() {
    expect(themeManager.theme).toEqual('dark_theme');
  });
});

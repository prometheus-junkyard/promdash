var servers = [];
var graphBlob = {};
describe('SingleWidgetCtrl', function() {
  var $controller;
  var $scope;
  var themeManager;
  beforeEach(inject(function(_$controller_, $rootScope, _ThemeManager_){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    themeManager = _ThemeManager_;
  }));

  it('loads correctly', function() {
    $controller('SingleWidgetCtrl', { $scope: $scope });
    expect($scope.servers).toEqual([]);
    expect($scope.globalConfig.aspectRatio).not.toBe(undefined);
  });

  it('sets a default theme', function() {
    $controller('SingleWidgetCtrl', { $scope: $scope });
    expect(themeManager.theme).toEqual('dark_theme');
  });
});

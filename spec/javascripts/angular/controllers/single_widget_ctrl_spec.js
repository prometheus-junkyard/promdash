var servers = [];
var graphBlob = {};
describe('SingleWidgetCtrl', function() {
  var $controller;
  var $scope;
  var themeManager;
  var fullscreenAspectRatio;
  var encoder;
  beforeEach(inject(function(_$controller_, $rootScope, _ThemeManager_, _FullScreenAspectRatio_, _URLHashEncoder_){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    themeManager = _ThemeManager_;
    fullscreenAspectRatio = _FullScreenAspectRatio_;
    encoder = _URLHashEncoder_;
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

  it('sets range and endTime on the widget', function() {
    var config = {
      widget: {
        type: 'graph',
        range: '2h',
        endTime: '21249819842',
      },
    };
    window.blob = encoder(config);
    expect($scope.widgets.length).toEqual(1);
  });

  it('sets a default theme', function() {
    expect(themeManager.theme).toEqual('dark_theme');
  });
});

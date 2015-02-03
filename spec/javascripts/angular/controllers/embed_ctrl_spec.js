describe('EmbedCtrl', function() {
  var $controller;
  var $scope;
  var fullscreenAspectRatio;
  beforeEach(inject(function(_$controller_, $rootScope, _FullScreenAspectRatio_){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    fullscreenAspectRatio = _FullScreenAspectRatio_;
  }));

  beforeEach(function() {
    $controller('EmbedCtrl', { $scope: $scope });
  });

  it('sets the aspect ratio to that of the full screen', function() {
    var r = fullscreenAspectRatio();
    expect($scope.globalConfig.aspectRatio).toEqual(r);
  });

  describe('active widget', function() {
    it('default', function() {
      expect($scope.activeWidget).toEqual(0);
      expect($scope.widgetClass(0)).toEqual('active_widget');
      for (var i = 1; i < 5; i++) {
        expect($scope.widgetClass(i)).toEqual('inactive_widget');
      }
    });

    it('increments the active widget', function() {
      $scope.widgets = [
        'fake',
        'fake',
        'fake'
      ];
      var i = 2;
      $scope.incrementActive(i);
      expect($scope.activeWidget).toEqual(i);
      expect($scope.widgetClass(i)).toEqual('active_widget');
    });
  });
});

describe('EmbedCtrl', function() {
  var $controller;
  var $scope;
  beforeEach(inject(function(_$controller_, $rootScope){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
  }));

  describe('active widget', function() {
    it('default', function() {
      $controller('EmbedCtrl', { $scope: $scope });
      expect($scope.activeWidget).toEqual(0);
      expect($scope.widgetClass(0)).toEqual('active_widget');
      for (var i = 1; i < 5; i++) {
        expect($scope.widgetClass(i)).toEqual('inactive_widget');
      }
    });

    it('increments the active widget', function() {
      $controller('EmbedCtrl', { $scope: $scope });
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

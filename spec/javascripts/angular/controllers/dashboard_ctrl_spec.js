describe('DashboardCtrl', function() {
  var $controller;
  var $scope;
  beforeEach(inject(function(_$controller_, $rootScope){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
  }));

  describe('visual toggles', function() {
    describe('clone modal', function() {
      beforeEach(function() {
        $controller('DashboardCtrl', { $scope: $scope });
      });

      it('starts closed', function() {
        expect($scope.showCloneControls).toEqual(false);
      });

      it('opens the controls', function() {
        $scope.showCloneMenu();
        expect($scope.showCloneControls).toEqual(true);
      });

      it('can close the modal', function() {
        expect($scope.showCloneControls).toEqual(false);
        $scope.showCloneMenu();
        expect($scope.showCloneControls).toEqual(true);
        $scope.closeCloneControls();
        expect($scope.showCloneControls).toEqual(false);
      });
    });

    describe('fullscreen', function() {
      beforeEach(function() {
        $controller('DashboardCtrl', { $scope: $scope });
      });

      it('starts not in fullscreen', function() {
        expect($scope.fullscreen).toEqual(false);
      });

      it('toggles to fullscreen', function() {
        $scope.enableFullscreen();
        expect($scope.fullscreen).toEqual(true);
      });

      it('leaves fullscreen', function() {
        $scope.enableFullscreen();
        expect($scope.fullscreen).toEqual(true);
        $scope.exitFullscreen();
        expect($scope.fullscreen).toEqual(false);
      });
    });
  });
});

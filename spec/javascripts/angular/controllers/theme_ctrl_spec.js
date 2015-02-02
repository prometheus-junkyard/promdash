describe('ThemeCtrl', function() {
  var $controller;
  var $scope;
  var themeManager;
  var modalService;
  beforeEach(inject(function(_$controller_, $rootScope, _ThemeManager_, _ModalService_){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    themeManager = _ThemeManager_;
    modalService = _ModalService_;
  }));

  it('sets the theme', function() {
    var theme = 'fancy_theme';
    themeManager.setTheme(theme);
    var controller = $controller('ThemeCtrl', { $scope: $scope });
    expect($scope.theme()).toEqual(theme);
  });

  it('sets the modal service', function() {
    var controller = $controller('ThemeCtrl', { $scope: $scope });
    expect($scope.ModalService).toEqual(modalService);
  });
});

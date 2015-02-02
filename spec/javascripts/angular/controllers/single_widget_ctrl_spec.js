var servers = [];
var graphBlob = {};
describe('SingleWidgetCtrl', function() {
  var $controller;
  var scope;
  beforeEach(inject(function(_$controller_, $rootScope){
    $controller = _$controller_;
    scope =  $rootScope;
  }));

  it('loads correctly', function() {
    var $scope = scope.$new(true);
    var controller = $controller('SingleWidgetCtrl', { $scope: $scope });
    expect($scope.servers).toEqual([]);
    expect($scope.globalConfig.aspectRatio).not.toBe(undefined);
  });

});

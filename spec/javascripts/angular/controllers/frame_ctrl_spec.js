describe('FrameCtrl', function() {
  var $controller;
  var $scope;
  beforeEach(inject(function(_$controller_, _VariableInterpolator_, $rootScope){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    $scope.frame = {};
  }));

  describe('frame.url', function() {
    var url = 'http://graphite/render/?target=alias(stats_counts.statsd.{{xxx}}, "{{yyy}}: derp")';
    beforeEach(function() {
      $scope.vars = {xxx: 'packets_received', yyy: 'alias name'};
      $scope.frame.url = url;
      $controller('FrameCtrl', { $scope: $scope });
      $scope.$apply();
    });

    it('doesnt escape or interpolate the displayed frame url', function() {
      expect($scope.frame.url).toEqual(url);
    });
  });

  describe('generating frame components', function() {
    it('only reads the search part of the url', function() {
      $scope.frame.url = 'http://graphite/render/?target=alias(stats_counts.statsd.xxx, "doot")#&target=derp&foo=bar&baz=qux';
      var controller = $controller('FrameCtrl', { $scope: $scope });
      $scope.generateFrameComponents();
      expect($scope.frameComponents).toEqual([
        {key: 'target', value: 'alias(stats_counts.statsd.xxx, "doot")'}
      ]);
    });

    it('splits the search', function() {
      $scope.frame.url = 'http://graphite/render/?target=alias(stats_counts.statsd.xxx, "de==rp")&target=derp&foo=bar&baz=qux';
      var controller = $controller('FrameCtrl', { $scope: $scope });
      $scope.generateFrameComponents();
      expect($scope.frameComponents).toEqual([
        {key: 'target', value: 'alias(stats_counts.statsd.xxx, "de==rp")'},
        {key: 'target', value: 'derp'},
        {key: 'foo', value: 'bar'},
        {key: 'baz', value: 'qux'}
      ]);
    });
  });
});

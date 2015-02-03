//= require spec_helper
dashboardData = {};
dashboardData.globalConfig = {
  numColumns: 2,
  aspectRatio: 0.75,
  theme: 'dark_theme',
  endTime: null,
  vars: {},
  widgets: [
    {}, {}, {}
  ],
};
describe('SharedGraphBehavior', function() {
  var sgb;
  var $scope;
  var $controller;
  var $location;
  beforeEach(inject(function(_$controller_, $rootScope, _SharedGraphBehavior_, _$location_){
    $controller = _$controller_;
    $scope = $rootScope.$new(true);
    $location = _$location_;
    sgb = _SharedGraphBehavior_;
  }));

  describe('url variables', function() {
    beforeEach(function() {
      $scope.globalConfig = {
        numColumns: 2,
        endTime: 'configEndTime',
        range: 'configRange',
        aspectRatio: 0.75,
        theme: 'dark_theme',
        vars: {},
      };
      $scope.widgets = [
        {range: 'widgetRange', endTime: 'widgetEndTime'},
        {range: 'widgetRange', endTime: 'widgetEndTime'},
        {range: 'widgetRange', endTime: 'widgetEndTime'},
      ];
    });

    it('sets range, endTime on globalConfig and widgets when set in url', function() {
      var date = '2015-02-03T19:11:59.350Z';
      var dateMS = Date.parse(date);
      var range = '300s';
      $location.search('range', range);
      $location.search('until', date);
      sgb($scope, $scope.globalConfig);
      $scope.$apply();
      expect($scope.globalConfig.endTime).toEqual(dateMS);
      expect($scope.globalConfig.range).toEqual(range);
      $scope.widgets.forEach(function(w) {
        expect(w.range).toEqual(range);
        expect(w.endTime).toEqual(dateMS);
      });
    });

    it('doesnt squash widget endtime or until time on initial load', function() {
      $location.search('range', null);
      $location.search('until', null);
      sgb($scope, $scope.globalConfig);
      $scope.$apply();
      expect($scope.globalConfig.endTime).toEqual('configEndTime');
      expect($scope.globalConfig.range).toEqual('configRange');
      $scope.widgets.forEach(function(w) {
        expect(w.range).toEqual('widgetRange');
        expect(w.endTime).toEqual('widgetEndTime');
      });
    });
  });
});

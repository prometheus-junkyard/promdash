//= require spec_helper
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
      {range: 'widgetRange', endTime: 'widgetEndTime', type:'graph'},
      {range: 'widgetRange', endTime: 'widgetEndTime', type:'frame'},
      {type:'pie'},
    ];
  });

  describe('globalConfig', function() {
    describe('$location', function() {
      it('doesnt change $location on initial load', function() {
        sgb($scope, $scope.globalConfig);
        $scope.$digest();
        expect($location.search().range).toEqual(undefined);
        expect($location.search().until).toEqual(undefined);
      });

      describe('removing params', function() {
        var range;
        var date;
        beforeEach(function() {
          date = (new Date()).toISOString();
          range = '300s';
          $location.search('range', range);
          $location.search('until', date);
        });

        it('range query param', function() {
          sgb($scope, $scope.globalConfig);
          $scope.$digest();
          expect($location.search().range).toEqual(range);
          $scope.globalConfig.range = '';
          $scope.$digest();
          expect($location.search().range).toEqual(undefined);
        });

        it('endTime query param', function() {
          sgb($scope, $scope.globalConfig);
          $scope.$digest();
          expect($location.search().until).toEqual(date);
          $scope.globalConfig.endTime = '';
          $scope.$digest();
          expect($location.search().until).toEqual(undefined);
        });
      });

      describe('adding params', function() {
        it('range query param', function() {
          sgb($scope, $scope.globalConfig);
          $scope.$digest();
          $scope.globalConfig.range = '300s';
          $scope.$digest();
          expect($location.search().range).toEqual('300s');
        });

        it('until query param', function() {
          sgb($scope, $scope.globalConfig);
          $scope.$digest();
          var d = new Date();
          $scope.globalConfig.endTime = d.getTime(); // UNIX timestamp.
          $scope.$digest();
          expect($location.search().until).toEqual(d.toISOString());
        });
      });
    });
  });

  describe('url variables', function() {
    it('sets range, endTime on globalConfig and widgets when set in url', function() {
      var date = '2015-02-03T19:11:59.350Z';
      var dateMS = Date.parse(date);
      var range = '300s';
      $location.search('range', range);
      $location.search('until', date);
      sgb($scope, $scope.globalConfig);
      $scope.$digest();
      expect($scope.globalConfig.endTime).toEqual(dateMS);
      expect($scope.globalConfig.range).toEqual(range);
      $scope.widgets.forEach(function(w) {
        if (w.type === "pie") {
          expect(w.range).toEqual(undefined);
          expect(w.endTime).toEqual(undefined);
        } else {
          expect(w.range).toEqual(range);
          expect(w.endTime).toEqual(dateMS);
        }
      });
    });

    it('doesnt squash widget endtime or until time on initial load', function() {
      $location.search('range', null);
      $location.search('until', null);
      sgb($scope, $scope.globalConfig);
      $scope.$digest();
      expect($scope.globalConfig.endTime).toEqual('configEndTime');
      expect($scope.globalConfig.range).toEqual('configRange');
      $scope.widgets.forEach(function(w) {
        if (w.type === "pie") {
          expect(w.range).toEqual(undefined);
          expect(w.endTime).toEqual(undefined);
        } else {
          expect(w.range).toEqual('widgetRange');
          expect(w.endTime).toEqual('widgetEndTime');
        }
      });
    });
  });
});

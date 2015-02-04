angular.module("Prometheus.directives").directive('datetimePicker', function() {
  return {
    scope: {
      // The date/time in milliseconds since the Epoch. null when unset.
      datetime: '=',
    },
    link: function(scope, element, attrs) {
      var picker = $(element[0]).datetimepicker({
        language: 'en',
        pickSeconds: false
      });

      picker.on('changeDate', function(e) {
        scope.$apply(function() {
          var date = picker.data('datetimepicker').getDate();
          if (date === null) {
            scope.datetime = null;
          } else {
            scope.datetime = date.getTime();
          }
        });
      });

      scope.$watch('datetime', function() {
        var date = null;
        if (scope.datetime !== null) {
          date = new Date(scope.datetime);
        }
        picker.data('datetimepicker').setValue(date);
      });
    }
  };
});

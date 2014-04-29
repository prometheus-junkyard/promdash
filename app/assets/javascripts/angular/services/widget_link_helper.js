angular.module("Prometheus.services").factory('WidgetLinkHelper', ["$http", "InputHighlighter", function($http, InputHighlighter) {
  return {
    createLink: function(data) {
      this.promise = $http.post('/w', data);
      return this;
    },
    setLink: function(scope) {
      if (!this.promise) {
        return;
      }
      this.promise.then(function(payload) {
        scope.widgetLink = location.origin + "/w/" + payload.data.id;
      });
      this.promise = null;
      return this;
    },
    highlightInput: function(event) {
      if (!event) {
        return;
      }

      // TODO: find more robust means of accessing the corresponding input field.
      var input = $(event.currentTarget).closest(".widget_wrapper").find("[ng-model=widgetLink]")[0];
      InputHighlighter(input);
    }
  };
}]);

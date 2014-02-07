angular.module("Prometheus.services").factory('ThemeManager', function() {
  return {
    theme: null,
    setTheme: function(theme) {
      this.theme = theme;
    }
  };
});

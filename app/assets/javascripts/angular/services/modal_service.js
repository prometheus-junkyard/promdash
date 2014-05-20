angular.module("Prometheus.services").factory('ModalService', ["$rootScope", function($rootScope) {
  var open = false;
  return {
    modalOpen: function() {
      return open;
    },
    closeModal: function() {
      open = false;
      $rootScope.$broadcast('closeModal');
    },
    toggleModal: function() {
      open = !open;
    }
  };
}]);

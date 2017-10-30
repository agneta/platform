(function() {

  var app = angular.module('MainApp');

  app.controller('SystemServerCtrl', function($scope, GIT) {
    GIT.status()
      .$promise
      .then(function(result) {
        console.log(result);
      });
  });


})();

(function() {

  var app = angular.module('MainApp');

  app.controller('SystemServerCtrl', function($scope, $rootScope, GIT, System) {

    function check() {
      GIT.graph()
        .$promise
        .then(function(result) {
          console.log(result);
          $scope.graph = result;
        });
    }
    check();

    $scope.fetch = function() {
      $rootScope.loadingMain = true;
      GIT.fetch()
        .$promise
        .then(function() {
          check();
        })
        .finally(function() {
          $rootScope.loadingMain = false;
        });
    };

    //------------------------------------------------

    var logs = $scope.logs = {};

    logs.load = function() {
      System.logs()
        .$promise
        .then(function(data) {
          logs.output = data;
        });
    };

    logs.load();


  });


})();

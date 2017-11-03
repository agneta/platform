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

    (function() {

      var logs = $scope.logs = {
        action: {
          onClick: selectAction
        }

      };

      function selectAction(action) {

        logs.actionSelected = action;
        logs.load();

      }

      logs.load = function() {
        logs.loading = true;
        System.logs()
          .$promise
          .then(function(data) {
            logs.output = data;
          })
          .finally(function() {
            logs.loading = false;
          });
      };

      selectAction($rootScope.viewData.extra.logs.actions[0]);

    })();



  });


})();

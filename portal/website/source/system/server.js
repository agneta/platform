(function() {

  var app = angular.module('MainApp');

  app.controller('SystemServerCtrl', function($scope, $rootScope, GIT, System, SocketIO) {

    var socket = SocketIO.connect('system');

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

      var entryLimit = 1000;

      function selectAction(action) {

        logs.actionSelected = action;
        logs.load(action);

      }

      logs.load = function() {
        var action = logs.actionSelected;
        logs.loading = true;
        System.logs({
          name: action.name
        })
          .$promise
          .then(function(data) {
            logs.output = data;
          })
          .finally(function() {
            logs.loading = false;
          });
      };

      logs.onEntry = function(entry) {
        logs.output.unshift(entry);
        while ($scope.logLines.length > entryLimit) {
          $scope.logLines.pop();
        }
      };

      socket.on('logs:change:error', function(result){
        console.log(result);
      });

      selectAction($rootScope.viewData.extra.logs.actions[0]);

    })();



  });


})();

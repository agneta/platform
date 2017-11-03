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
      var channel;

      function selectAction(action) {

        logs.actionSelected = action;
        logs.load(action);

        if(channel){
          channel.unsubscribe();
        }
        console.log(action.name);
        channel = socket.on('logs:change:'+action.name, function(entries){
          console.log(entries);
          for(var entry of entries){
            logs.output.entries.unshift(entry);
          }
        });

      }

      logs.load = function() {
        var action = logs.actionSelected;
        logs.loading = true;
        System.logs({
          name: action.name
        })
          .$promise
          .then(function(data) {
            data.entries.reverse();
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

      selectAction($rootScope.viewData.extra.logs.actions[0]);

    })();



  });


})();

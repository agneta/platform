(function() {

  var app = angular.module('MainApp');

  app.controller('SystemServerCtrl', function($scope, $rootScope, Process, SocketIO, $mdDialog) {

    var socket = SocketIO.connect('system');

    (function() {

      var git = $scope.git = {};

      function check() {
        Process.changesList({
          __endpoint: 'aaaaaa'
        })
          .$promise
          .then(function(result) {
            console.log(result);
            $scope.graph = result;
          });
      }
      check();

      git.fetch = function() {
        $rootScope.loadingMain = true;
        Process.changesRefresh({
          __endpoint: 'aaaaaa'
        })
          .$promise
          .then(function() {
            check();
          })
          .finally(function() {
            $rootScope.loadingMain = false;
          });
      };

      git.update = function() {

        git.updating = true;
        System.restart({

        })
          .$promise
          .then(function() {

            SocketIO.socket.once('connect', function() {

              git.updating = false;

              $mdDialog.open({
                partial: 'success',
                //nested: true,
                data: {
                  content: 'System is now updated'
                }
              });

            });

          });
      };

    })();


    //------------------------------------------------

    (function() {

      var logs = $scope.logs = {
        action: {
          onClick: selectAction
        },
        output: {
          entries: []
        }
      };

      var entryLimit = 1000;
      var channel;

      function selectAction(action) {

        logs.actionSelected = action;
        logs.load(action);

        if (channel) {
          channel.unsubscribe();
        }
        //console.log(action.name);
        channel = socket.on('logs:change:' + action.name, function(entries) {
          //console.log(entries);
          for (var entry of entries) {
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

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/system/server.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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

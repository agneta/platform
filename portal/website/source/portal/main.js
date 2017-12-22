/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/portal/main.js
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

  app.run(function($rootScope, $mdToast, Portal) {

    $rootScope.notify = function(options) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(options.message)
          .position('bottom left')
          .hideDelay(3000)
      );
    };

    Portal.socket.on('activity:new', function(activity) {

      var message = 'Activity: ';
      if (activity.account) {
        message += activity.account.name || activity.account.email;
      }
      message += ' ' + activity.action_value;

      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom right')
          .hideDelay(3000)
      );

    });


  });

  var toggle = {
    value: false
  };

  agneta.directive('AgLiveToggleCtrl', function($rootScope) {

    var vm = this;
    vm.value = toggle.value;
    $rootScope.isProduction = function() {
      return toggle.value;
    };

    vm.onChange = function(value) {
      if (value == toggle.value) {
        return;
      }
      toggle.value = value;
      $rootScope.$broadcast('productionMode', value);
    };

    vm.onChange(toggle.value);

  });

  agneta.directive('fileUploader', function(Portal, $timeout) {

    var vm = this;

    var socket = Portal.socket.media;
    vm.files = {};
    vm.filesCount;

    socket.on('file:operation:error', function(error) {
      console.error(error);
    });

    socket.on('file:operation:progress', function(result) {
      console.log(result);
      vm.files[result.location] = result;
      onUpdate();
    });

    socket.on('file:operation:complete', function(result) {
      delete vm.files[result.location];
      onUpdate();
    });

    function onUpdate() {

      var progress = 0;
      var count = 0;
      for (var location in vm.files) {
        var file = vm.files[location];
        progress += file.percentage;
        count++;
      }
      vm.filesCount = count;
      vm.progress = progress / count;

      $timeout();

    }

  });

  app.component('memoryUsage', {
    templateUrl: 'memory-usage.html',
    bindings: {
      update: '&'
    },
    controller: function(Portal, $timeout) {

      var ctrl = this;

      ctrl.update = {
        usage: {
          heapTotal: {
            percentage: 0
          },
          heapUsed: {
            percentage: 0
          },
          rss: {
            percentage: 0
          }
        }
      };

      this.$onInit = function() {

        Portal.socket.on('memory:update', function(update) {
          ctrl.update = update;
          $timeout();
        });
      };
    }
  });


})();

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/utility.js
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
  var logLimit = 3000;

  app.page('UtilityCtrl', function($rootScope, $mdToast, Utility, SocketIO, $parse, $timeout) {

    var vm = this;

    vm.logLines = [];
    vm.progressBars = {};
    vm.runOptions = {};

    var socket = SocketIO.connect('utilities');
    var utilityName = $rootScope.viewData.extra.name;

    vm.checkCondition = function(parameter) {
      if (parameter.if) {
        if (angular.isObject(parameter.if)) {
          return $parse(parameter.if.prop)(vm.runOptions) == parameter.if.equals;
        }
        return $parse(parameter.if)(vm.runOptions);
      }
      return true;
    };

    function socketOn(name, cb) {
      socket.on(utilityName + ':' + name, cb);
    }

    Utility.state({
      name: utilityName
    })
      .$promise
      .then(function(options) {
        vm.parameters = options.parameters;
      });

    socketOn('notify', $rootScope.notify);
    socketOn('init', function(options) {
      vm.parameters = options.parameters;
      $timeout();
    });

    socketOn('status', function(data) {
      vm.status = data;
      $timeout();
    });

    socketOn('addLine', function(options) {
      options[options.type] = true;
      vm.addLine(options);
      $timeout();
    });

    socketOn('progress:new', function(data) {
      console.log(data);
      vm.progressBars[data.id] = {
        value: 0,
        count: 0,
        length: data.length,
        title: data.options.title
      };
      $timeout();
    });

    socketOn('progress:update', function(data) {
      var progressBar = vm.progressBars[data.id];
      progressBar.length = data.length;
      onProgressUpdate(progressBar);
      $timeout();
    });

    socketOn('progress:tick', function(data) {

      var progressBar = vm.progressBars[data.id];
      if (!progressBar) {
        return;
      }
      if (progressBar.complete) {
        console.error('Ticking on a complete progress bar');
        return;
      }

      progressBar.current = data.options;
      progressBar.count++;
      onProgressUpdate(progressBar);
      $timeout();

    });

    function onProgressUpdate(progressBar) {
      progressBar.value = progressBar.count / progressBar.length * 100;

      if (progressBar.count == progressBar.length) {
        progressBar.complete = true;
        progressBar.current = {
          title: 'Complete'
        };
      } else {
        progressBar.complete = false;
      }
    }

    vm.run = function() {
      vm.clear();
      vm.log('Starting...');
      Utility.start({
        name: utilityName,
        options: vm.runOptions
      });
    };

    vm.clear = function() {
      vm.logLines = [];
      vm.progressBars = {};
    };

    vm.log = function(message) {
      vm.addLine({
        log: true,
        message: message
      });
    };

    vm.addLine = function(line) {
      vm.logLines.unshift(line);
      while (vm.logLines.length > logLimit) {
        vm.logLines.pop();
      }
    };

    vm.socket = socket;

    vm.log('Click "start" to run the utility...');

  });

})();

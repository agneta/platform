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

  app.controller('UtilityCtrl', function($scope, $rootScope, $mdToast, Utility, SocketIO, $parse) {

    $scope.logLines = [];
    $scope.progressBars = {};
    $scope.runOptions = {};

    var socket = SocketIO.connect('utilities');
    var utilityName = $rootScope.viewData.extra.name;

    $scope.checkCondition = function(parameter) {
      if (parameter.if) {
        if (angular.isObject(parameter.if)) {
          return $parse(parameter.if.prop)($scope.runOptions) == parameter.if.equals;
        }
        return $parse(parameter.if)($scope.runOptions);
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
        $scope.parameters = options.parameters;
      });

    socketOn('notify', $rootScope.notify);
    socketOn('init', function(options) {
      $scope.parameters = options.parameters;
      $scope.$apply();
    });

    socketOn('status', function(data) {
      $scope.status = data;
      $scope.$apply();
    });

    socketOn('addLine', function(options) {
      options[options.type] = true;
      $scope.addLine(options);
      $scope.$apply();
    });

    socketOn('progress:new', function(data) {
      console.log(data);
      $scope.progressBars[data.id] = {
        value: 0,
        count: 0,
        length: data.length,
        title: data.options.title
      };
      $scope.$apply();
    });

    socketOn('progress:update', function(data) {
      var progressBar = $scope.progressBars[data.id];
      progressBar.length = data.length;
      onProgressUpdate(progressBar);
      $scope.$apply();
    });

    socketOn('progress:tick', function(data) {

      var progressBar = $scope.progressBars[data.id];
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
      $scope.$apply();

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

    $scope.run = function() {
      $scope.clear();
      $scope.log('Starting...');
      Utility.start({
        name: utilityName,
        options: $scope.runOptions
      });
    };

    $scope.clear = function() {
      $scope.logLines = [];
      $scope.progressBars = {};
    };

    $scope.log = function(message) {
      $scope.addLine({
        log: true,
        message: message
      });
    };

    $scope.addLine = function(line) {
      $scope.logLines.unshift(line);
      while ($scope.logLines.length > logLimit) {
        $scope.logLines.pop();
      }
    };

    $scope.socket = socket;

    $scope.log('Click "start" to run the utility...');

  });

})();

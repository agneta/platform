/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/media/main.module.js
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
var app = angular.module('MainApp');

app.service('AgMediaExplorer', function(
  $rootScope,
  Media,
  Media_Private,
  MediaPreview,
  Upload,
  SocketIO,
  $timeout,
  $mdToast,
  $mdDialog,
  $location,
  $sce,
  $routeParams,
  Search_Engine,
  Portal
) {
  this.init = function(options) {
    var vm = options.vm;
    var config = options.config;

    vm.mediaModel = config.model;

    Search_Engine.init({
      name: config.keywordFileName,
      scope: vm,
      model: config.model,
      onResult: function(result) {
        for (var index in result.items) {
          var object = result.items[index];
          config.preview.set(object);
        }
      }
    });

    config.preview.toScope(vm);

    var dirRoot = {
      name: 'root',
      location: ''
    };

    vm.dirs = [dirRoot];

    //-----------------------------------------

    vm.openFolder = function(location) {
      vm.searchClear();

      location = location || '';
      location = location.location || location;

      var dirs = location.split('/');
      var locations = [];
      var result = [dirRoot];
      for (var i in dirs) {
        i /= 1;

        var dir = dirs[i];

        if (!dir || !dir.length) {
          continue;
        }

        locations.push(dir);

        result.push({
          name: dir,
          location: locations.join('/')
        });
      }

      vm.dirs = result;
      vm.selectDir(vm.dirs[result.length - 1]);
    };

    var startingLocation = vm.startingLocation || $routeParams.location;

    vm.selectDir = function(dir) {
      vm.dir = dir;
      vm.refresh();
    };

    require('./directory.module')({
      vm: vm,
      Portal: Portal,
      $location: $location,
      $rootScope: $rootScope,
      config: config,
      $mdDialog: $mdDialog,
      Upload: Upload
    });

    vm.openFolder(startingLocation);
  };
});

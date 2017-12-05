/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/media/main.js
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

/*global _e_directory*/
/*global _e_itemMenu*/

(function() {

  var app = angular.module('MainApp');

  app.controller('MediaCtrl', function($rootScope, Upload, MediaOpt, SocketIO, $timeout, $mdToast, $mdDialog, $location, $sce, $routeParams, Search_Engine, Portal) {

    var apiMedia = MediaOpt.api;
    var partialFile = MediaOpt.partial;
    var Media = MediaOpt.model;
    var MediaPreview = MediaOpt.preview;
    var vm = this;

    if (MediaOpt.public) {
      apiMedia = MediaOpt.public.api;
      partialFile = MediaOpt.public.partial;
      Media = MediaOpt.public.model;
      MediaPreview = MediaOpt.public.preview;
    }

    if (MediaOpt.private) {
      if ($rootScope.viewData.extra && $rootScope.viewData.extra.private) {
        apiMedia = MediaOpt.private.api;
        partialFile = MediaOpt.private.partial;
        Media = MediaOpt.private.model;
        MediaPreview = MediaOpt.private.preview;
      }
    }
    vm.mediaModel = Media;

    Search_Engine.init({
      scope: vm,
      model: Media,
      keywords: agneta.get_asset('generated/keywords_media.json'),
      onResult: function(result) {
        for (var index in result.items) {
          var object = result.items[index];
          MediaPreview.set(object);
        }
      }
    });

    MediaPreview.toScope(vm);

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

    _t_template('edit/media/directory');
    _e_directory(vm, Portal, $location, $rootScope, Media, MediaPreview, $mdDialog, Upload, apiMedia, partialFile);

    vm.openFolder(startingLocation);

  });

  _t_template('edit/media/item-menu');
  _e_itemMenu(app);

})();

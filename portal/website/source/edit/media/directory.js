/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/media/directory.js
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

  var socket = SocketIO.connect('media');
  var objects = [];
  var lastResult = null;
  var loadmoreCount = 20;

  function readdir() {

    var dir = $scope.dir;
    var query = '';

    if (dir.location.length) {
      $location.search('location', dir.location);
    } else {
      $location.search('location', null);
    }

    objects = [];
    lastResult = null;
    $scope.objectsOnDemand.numLoaded_ = 0;
    $scope.objectsOnDemand.toLoad_ = 0;
    $scope.objectsOnDemand.fetchMoreItems_(1);

  }

  $scope.refresh = readdir;

  socket.on('files:upload:complete', readdir);
  socket.on('file:upload:complete', readdir);

  //---------------------------------------------------

  $scope.objectsOnDemand = {
    numLoaded_: 0,
    toLoad_: 0,
    getItemAtIndex: function(index) {
      if (index > this.numLoaded_) {
        this.fetchMoreItems_(index);
        return null;
      }
      return objects[index];
    },
    getLength: function() {
      return this.numLoaded_ + 1;
    },
    fetchMoreItems_: function(index) {
      var self = this;
      var marker = null;
      if (lastResult) {
        if (lastResult.truncated) {
          marker = lastResult.nextMarker;
        } else {
          return;
        }
      }

      if (!this.toLoad_) {
        this.toLoad_ = 1;
        return;
      }

      if (this.toLoad_ - this.numLoaded_ > loadmoreCount) {
        return;
      }

      if (this.toLoad_ < index) {
        this.toLoad_ += loadmoreCount;

        $rootScope.loadingMain = true;

        var params = {};

        if ($scope.dir.location) {
          params.dir = $scope.dir.location;
        }
        if (marker) {
          params.marker = marker;
        }

        console.warn('fetchMoreItems_', index, this.numLoaded_, this.toLoad_);


        Media.list(params)
          .$promise
          .then(function(result) {

            lastResult = result;

            for (var _index in result.objects) {
              var object = result.objects[_index];
              MediaPreview.set(object);
            }

            $rootScope.loadingMain = false;
            $scope.count = result.count;
            objects = objects.concat(result.objects);

            if ($scope.onObjects) {
              $scope.onObjects(objects);
            }

            self.numLoaded_ = objects.length;
          });

      }
    }
  };

  //---------------------------------------------------
  $scope.isLoadingMore = function(object) {
    return !object &&
            (
              $scope.objectsOnDemand.numLoaded_ === 0 ||
                $scope.objectsOnDemand.numLoaded_ < $scope.count
            );
  };
  //---------------------------------------------------

  $scope.newFolder = function(file) {

    var confirm = $mdDialog.prompt()
      .title('New Folder')
      .textContent('Enter the name of the folder you want to create.')
      .placeholder('Name')
      .ok('Create')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function(name) {
      Media.newFolder({
        dir: $scope.dir.location,
        name: name
      })
        .$promise
        .then(readdir);
    });

  };

  $scope.objectClick = function(object) {

    switch (object.type) {
    case 'folder':
      $scope.openFolder(object);
      break;
    default:
      $scope.openObject(object);
      break;

    }
  };

  $scope.toolbarClick = function($event) {
    $event.stopPropagation();
  };

  $scope.isFolder = function(object) {
    return object.type == 'folder';
  };

  $scope.openObject = $scope.openObject || function(object) {
    $mdDialog.open({
      partial: partialFile,
      data: {
        apiMedia: apiMedia,
        Media: Media,
        MediaPreview: MediaPreview,
        location: object.location,
        onChange: function(file) {
          $scope.refresh();
        }
      }
    });
  };

  $scope.uploadFiles = function(objects, errFiles) {

    if (errFiles && errFiles.length) {
      console.error(errFiles);
    }

    if (objects && objects.length) {
      Upload.upload({
        url: agneta.url(apiMedia + 'upload-files'),
        data: {
          dir: $scope.dir.location,
          objects: objects
        },
        arrayKey: ''
      }).then(function(response) {}, function(response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      }, function(evt) {
        $scope.uploadProgress = Math.min(100, parseInt(100.0 *
                    evt.loaded / evt.total));
      });

    }
  };
})();

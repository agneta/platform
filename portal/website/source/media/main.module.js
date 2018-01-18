var app = angular.module('MainApp');

app.service('AgMedia', function(
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

  this.public = {
    keywordFileName: 'keywords_media_public',
    api: 'services/api/media/',
    partial: 'file',
    model: Media,
    preview: MediaPreview.public
  };

  this.private = {
    keywordFileName: 'keywords_media_private',
    api: 'services/api/media-private/',
    partial: 'file-private',
    model: Media_Private,
    preview: MediaPreview.private
  };

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

    require('media/directory.module')({
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

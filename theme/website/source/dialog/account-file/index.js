agneta.directive('AgUploadPicture', function(
  $rootScope,
  data,
  Upload,
  Account
) {
  var vm = this;
  var model = data.model || Account;
  var method = data.method || 'account/media-upload';
  var query = data.query || {};

  if (!query.location) {
    console.error('location in query is required');
  }

  query.type = data.type || 'public';
  vm.type = query.type;

  var getMedia;
  switch (query.type) {
    case 'public':
      getMedia = agneta.get_media;
      break;
    case 'private':
      getMedia = agneta.prv_media;
      break;
    default:
      console.error('Uknown type: ' + query.type);
      break;
  }

  agneta.extend(vm, 'AgDialogCtrl');

  function load() {
    vm.loading = true;
    model
      .mediaGet(query)
      .$promise.then(function(result) {
        if (!result.location) {
          media.file = null;
          return;
        }
        media.file = result;
        media.source = getMedia(result.location, 'medium');
        media.url = getMedia(result.location);
      })
      .finally(function() {
        vm.loading = false;
      });
  }

  load();

  //-----------------------------------
  // Media

  var media = (vm.media = {});

  media.privacyType = function(value) {
    var privacy = media.file.privacy || {};
    privacy.type = value;
    vm.loading = true;
    model
      .mediaUpdate(
        angular.extend(
          {
            privacy: privacy
          },
          query
        )
      )
      .$promise.then(function() {
        return load();
      });
  };

  media.upload = function(object) {
    if (!object) {
      return;
    }
    vm.loading = true;

    var options = {
      url: agneta.url_api(method),
      data: angular.extend({}, query)
    };

    options.data.object = object;

    Upload.upload(options)
      .then(function() {
        if (data.onUploaded) {
          data.onUploaded();
        }
      })
      .finally(function() {
        load();
        vm.loading = false;
      });
  };
});

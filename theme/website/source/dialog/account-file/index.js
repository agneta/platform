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
  var accountId = (query.accountId =
    query.accountId || $rootScope.account.profile.id);

  if (query.location) {
    console.error('location in query is required');
  }

  query.type = data.type || 'public';
  var getMedia;
  switch (query.type) {
    case 'public':
      getMedia = agneta.get_media;
      break;
    case 'private':
      getMedia = agneta.prv_media;
      break;
  }

  agneta.extend(vm, 'AgDialogCtrl');

  function load() {
    vm.loading = true;
    model
      .mediaGet(query)
      .$promise.then(function(result) {
        media.file = result;
      })
      .finally(function() {
        vm.loading = false;
      });
  }

  load();

  //-----------------------------------
  // Media

  var media = (vm.media = {});
  var mediaBase = `account/${accountId}/profile`;

  media.source = getMedia(mediaBase, 'medium');
  media.url = getMedia(mediaBase);

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

    if (data.account) {
      options.data.accountId = accountId;
    }

    options.data.object = object;

    Upload.upload(options)
      .then(function() {
        if (data.onUploaded) {
          data.onUploaded();
        }
        vm.close();
      })
      .finally(function() {
        vm.loading = false;
      });
  };
});

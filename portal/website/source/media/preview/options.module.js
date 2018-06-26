var app = angular.module('MainApp');

app.service('AgMedia', function(Media, Media_Private, MediaPreview, $mdDialog) {
  var service = this;

  service.public = {
    keywordFileName: 'keywords_media_public',
    api: 'services/api/media/',
    partial: 'file',
    model: Media,
    preview: MediaPreview.public
  };

  service.private = {
    keywordFileName: 'keywords_media_private',
    api: 'services/api/media-private/',
    partial: 'file-private',
    model: Media_Private,
    preview: MediaPreview.private
  };

  service.explorer = function(options) {
    var type = options.type;
    var data = options.data || {};

    if (angular.isString(type)) {
      type = service[type];
    }

    if (!data.location) {
      $mdDialog.open({
        nested: true,
        partial: 'select',
        data: angular.extend(data, {
          media: type,
          file: {
            dir: data.dir
          }
        })
      });
      return;
    }

    $mdDialog.open({
      partial: type.partial,
      nested: true,
      data: angular.extend(data, {
        media: type
      })
    });
  };
});

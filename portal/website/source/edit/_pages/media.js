(function() {

    var media = {};

    media.editPrivate = function(field, parent, key) {

        media.edit(field, parent, key, MediaOpt.private);

    };


    media.edit = function(field, parent, key, mediaOptions) {

        var parentValue = parent.__value;
        var dataValue = parentValue[key].__value;

        mediaOptions = mediaOptions || MediaOpt.public;

        $mdDialog.open({
            partial: mediaOptions.partial,
            data: {
                config: {
                    dirLock: true
                },
                apiMedia: mediaOptions.api,
                Media: mediaOptions.model,
                MediaPreview: mediaOptions.preview,
                location: dataValue.location,
                dir: getBasePath(field),
                onApply: function(file) {
                    setFilePath(dataValue, file.location);
                    $scope.save();
                },
                onDelete: function() {
                    $scope.removeValue(key, parentValue);
                    $scope.save();
                }
            }
        });

    };

    media.backgroundImage = function(data) {
        data = dataValue(data);

        if (data.location && !data.icon && data.type) {
            data.icon = MediaPreview.getIcon(data);
        }

        if (data.location &&
            (!data.type)
        ) {
            Media.details({
                    location: data.location
                })
                .$promise
                .then(function(file) {
                    data.type = file.type;
                    data.updatedAt = file.updatedAt;
                    console.log(file);
                });

            data.type = 'uknown';
        } else {
            return MediaPreview.backgroundImage(data);
        }

    };

    media.getIcon = function(data) {
        data = dataValue(data);
        return MediaPreview.objectIcon(data);
    };

    media.hasBackground = function(data) {
        data = dataValue(data);
        return MediaPreview.hasBackground(data);
    };

    $scope.media = media;

})();

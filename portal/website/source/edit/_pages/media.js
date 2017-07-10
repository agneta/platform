(function() {

    var media = {};

    media.editPrivate = function(field, parent, key) {

        media.edit(field, parent, key, true);

    };


    media.edit = function(field, parent, key, isPrivate) {

        var parentValue = parent.__value;
        var dataValue = parentValue[key].__value;
        var mediaOptions = MediaOpt.public;

        if (dataValue.private) {
            isPrivate = true;
        }

        if (isPrivate) {
            console.log('isPrivate');
            dataValue.private = true;
            mediaOptions = MediaOpt.private;

        } else {
            delete dataValue.private;
        }

        $mdDialog.open({
            partial: mediaOptions.partial,
            data: {
                config: {
                    dirLock: true
                },
                media: mediaOptions,
                location: dataValue.location,
                dir: getBasePath(field),
                onApply: function(file) {
                    dataValue.type = file.type;
                    dataValue.updatedAt = file.updatedAt;
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

    function getMedia(data) {
        if (data.private) {
            return MediaOpt.private;
        }

        return MediaOpt.public;
    }

    media.backgroundImage = function(child) {

        var data = dataValue(child);
        var media = getMedia(data);

        if (data.location && !data.icon && data.type) {
            data.icon = media.preview.getIcon(data);
        }

        if (data.location && data.type) {
            return media.preview.backgroundImage(data);
        }

    };

    media.getIcon = function(child) {
        var data = dataValue(child);
        var media = getMedia(data);
        return media.preview.objectIcon(data);
    };

    media.hasBackground = function(child) {
        var data = dataValue(child);
        var media = getMedia(data);
        return media.preview.hasBackground(data);
    };

    $scope.media = media;

})();

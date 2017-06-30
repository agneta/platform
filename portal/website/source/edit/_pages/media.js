(function() {

    var media = {};

    media.edit = function(field, parent, key) {

        var parentValue = parent.__value;
        var dataValue = parentValue[key].__value;

        $mdDialog.open({
            partial: 'file',
            data: {
                config: {
                    dirLock: true
                },
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

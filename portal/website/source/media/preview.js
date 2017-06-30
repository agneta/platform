(function() {

    app.service('MediaPreview', function() {
        var types = {
            file: {
                icon: 'material/insert-drive-file',
            },
            video: {
                icon: 'material/videocam',
            },
            image: {
                icon: 'material/photo',
            },
            folder: {
                icon: 'material/folder',
            }
        };

        this.set = function(object) {

            object.background = backgroundImage(object);

            if (!object.background) {
                object.icon = objectIcon(object);
                if (!object.icon) {
                    object.extension = object.ext;
                }
            }

            return object;
        };

        this.hasBackground = function(file) {
            switch (file.type) {
                case 'image':
                    return true;
            }
        };

        //------------------------------------------------------------

        function backgroundImage(file, size) {
            size = size || 'square';
            var result;
            if (file.type == 'image') {
                result = "url(" + getUrl(file, size) + ')';
                return result;
            }
        }

        this.backgroundImage = backgroundImage;

        //------------------------------------------------------------

        function getUrl(file, size) {
            var version = new Date(file.updatedAt).valueOf();
            return agneta.get_media(file.location, size) + '?version=' + version;
        }


        this.getUrl = getUrl;

        //------------------------------------------------------------


        function objectIcon(object) {

            var icon = getIcon(object);

            if (icon) {
                return agneta.get_media(icon);
            }

        }

        this.objectIcon = objectIcon;

        //------------------------------------------------------------

        function getIcon(object) {
            if (object.type == 'icon') {
                return object.location;
            }

            var type = types[object.type];
            if (type && type.icon) {
                return 'icons/' + type.icon;
            }
        }

        this.getIcon = getIcon;

        //------------------------------------------------------------


        this.toScope = function(scope) {
            scope.preview = scope.preview || {};
            scope.preview.hasBackground = this.hasBackground;
            scope.preview.backgroundImage = this.backgroundImage;
            scope.preview.objectIcon = this.objectIcon;
            scope.preview.get = this.get;
        };
    });
})();

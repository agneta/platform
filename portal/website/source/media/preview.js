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

        this.init = function(options) {

            options = options || {};

            var preview = {};
            var get_media = options.get_media || agneta.get_media;

            preview.set = function(object) {

                object.background = backgroundImage(object);

                if (!object.background) {
                    object.icon = objectIcon(object);
                    if (!object.icon) {
                        object.extension = object.ext;
                    }
                }

                return object;
            };

            preview.hasBackground = function(file) {
                switch (file.type) {
                    case 'image':
                    case 'icon':
                        return true;
                }
            };

            //------------------------------------------------------------

            function backgroundImage(file, size) {
                var url = image(file, size);
                if (url) {
                    return "url(" + url + ')';
                }
            }

            function image(file, size) {
                size = size || 'square';
                switch (file.type) {
                    case 'image':
                        return getUrl(file, size);
                    case 'icon':
                        return getUrl(file);
                }
            }

            preview.backgroundImage = backgroundImage;
            preview.image = image;

            //------------------------------------------------------------

            function getUrl(file, size) {
                var version = new Date(file.updatedAt).valueOf();
                return get_media(file.location, size) + '?version=' + version;
            }


            preview.getUrl = getUrl;

            //------------------------------------------------------------


            function objectIcon(object) {

                var location = getIcon(object);

                if (location) {
                    return getUrl({
                        location: location,
                        updatedAt: object.updatedAt
                    });
                }

            }

            preview.objectIcon = objectIcon;

            //------------------------------------------------------------

            function getIcon(object) {

                var type = types[object.type];
                if (type && type.icon) {
                    return 'icons/' + type.icon;
                }
            }

            preview.getIcon = getIcon;

            preview.toScope = function(scope) {
                scope.preview = scope.preview || {};
                scope.preview.hasBackground = preview.hasBackground;
                scope.preview.backgroundImage = preview.backgroundImage;
                scope.preview.objectIcon = preview.objectIcon;
                scope.preview.get = preview.get;
            };

            return preview;

        };

        this.public = this.init();
        this.private = this.init({
            get_media: agneta.prv_media
        });

    });
})();

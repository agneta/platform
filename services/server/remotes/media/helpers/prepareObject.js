const mime = require('mime-types');
const urljoin = require('url-join');
const prettyBytes = require('pretty-bytes');

module.exports = function(Model, app) {

    Model.__prepareObject = function(object) {

        if (!object) {
            return;
        }

        var dir = object.location.split('/');
        dir.pop();
        dir = dir.join('/');

        object.dir = dir;

        switch (object.type) {
            case 'folder':
                return object;
        }

        object.url = urljoin('//', Model.__bucket.host, object.location);
        object.size = object.size ? prettyBytes(parseFloat(object.size)) : null;
        object.type = app.helpers.mediaType(object.contentType);
        object.ext = mime.extension(object.contentType);

        return object;
    };

};

const mime = require('mime-types');
const prettyBytes = require('pretty-bytes');

module.exports = function(Model, app) {

    var prjHelpers = app.get('options').client.app.locals;

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

        object.url = prjHelpers.prv_media(object.location);
        object.size = object.size ? prettyBytes(parseFloat(object.size)) : null;
        object.type = app.helpers.mediaType(object.contentType);
        object.ext = mime.extension(object.contentType);

        return object;
    };

};

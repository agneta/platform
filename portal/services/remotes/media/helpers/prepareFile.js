const S = require('string');
const path = require('path');
const fs = require('fs-extra');

module.exports = function(Model, app) {

    Model.__prepareFile = function(file, options) {

        var params = Model.__fixParams(file, options);

        var name = params.name;
        var dir = params.dir;
        var location = params.location;

        if (location) {
            var parsedLocation = path.parse(location);
            dir = parsedLocation.dir;
            name = parsedLocation.name;
        } else {

            if (!name) {
                name = path.parse(file.originalname).name;
            }

            name = S(name).slugify().s;
            location = Model.__getMediaPath(dir, name);
        }

        //console.log('prepare file', location, dir);

        var type = app.helpers.mediaType(file.mimetype);
        var stream = fs.createReadStream(file.path);

        //-----------------------------------------------

        return Model.__sendFile({
                location: location,
                type: type,
                dir: dir,
                size: file.size,
                mimetype: file.mimetype,
                name: name,
                stream: stream
            })
            .then(function(result) {
                return fs.unlinkAsync(file.path)
                    .then(function() {
                        return Model.__prepareObject(result);
                    });
            })
            .catch(function(error) {
                console.error(error);
                Model.io.emit('file:upload:error', error);
            });
    };
};

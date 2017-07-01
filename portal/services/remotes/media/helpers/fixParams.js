const path = require('path');
const S = require('string');

module.exports = function(Model) {

    Model.__fixParams = function(file, params) {

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

        return {
            name: name,
            dir: dir,
            location: location
        };

    };

};

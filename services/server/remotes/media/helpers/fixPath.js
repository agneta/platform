const path = require('path');

module.exports = function(Model) {

    Model.__fixPath = function(mediaPath) {
        mediaPath = path.normalize(mediaPath);

        if (mediaPath[0] == '/') {
            return mediaPath.substring(1);
        }
        return mediaPath;
    };

};

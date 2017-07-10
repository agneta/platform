const path = require('path');

module.exports = function(Model) {

    Model.__getMediaPath = function(dir, name) {

        dir = dir || '';
        var result = path.join(dir, name);

        return result;
    };
};

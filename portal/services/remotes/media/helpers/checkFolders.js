const Promise = require('bluebird');

module.exports = function(Model) {

    Model.__checkFolders = function(options) {
        var dirParts = options.dir.split('/');
        var dir = '';
        return Promise.each(dirParts, function(name) {
            return Model.newFolder(name, dir)
                .then(function() {
                    if (dir.length) {
                        dir += '/';
                    }
                    dir += name;
                });
        });
    };

};

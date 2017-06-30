var Promise = require('bluebird');


module.exports = function(locals) {

    var config = require('./config')(locals);
    var scripts = require('./scripts')(locals);
    var pages = require('./pages')(locals);

    return {
        pages: pages,
        config: config,
        scripts: scripts,
        init: function() {
            var loadConfig = locals.load;
            return config()
                .then(function() {
                    if (loadConfig.scripts) {
                        return scripts();
                    }
                });
        },
        start: function() {

            var promise = Promise.resolve();
            var loadConfig = locals.load;

            if (loadConfig.pages) {
                promise = promise.then(pages);
            }

            return promise;

        }
    };

};

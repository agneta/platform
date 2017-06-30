var Promise = require('bluebird');

module.exports = function(util) {

    var project = util.locals.project;

    return {
        run: function(options) {
            if (!options.env) {
                return Promise.reject({
                    message: 'The environment is required'
                });
            }

            var web = util.locals.web;

            return web.build({
                logger: util,
                progress: util.progress,
                env: options.env,
                config: {
                    assets: true,
                    pages: true
                }
            });

        },
        parameters: [{
            name: 'env',
            title: 'Environment',
            type: 'radio',
            values: [{
                name: 'local',
                title: 'Local'
            }, {
                name: 'production',
                title: 'Production'
            }]
        }]
    };

};

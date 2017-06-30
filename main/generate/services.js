const log = require('../log');
const terminal = require('../server/terminal');
const projectPaths = require('../paths').project;
const Promise = require('bluebird');

module.exports = function() {

    terminal()
        .then(function(servers) {

            return Promise.map([{
                    server: servers.servicesPortal,
                    dir: projectPaths.portalGenerated
                },
                {
                    server: servers.servicesWebsite,
                    dir: projectPaths.generated
                },
            ], function(service) {
                return service.server.locals.app.generate.methods({
                    outputDir: service.dir
                });
            });

        })
        .then(function() {
            log.success('Exported Services');
        });
};

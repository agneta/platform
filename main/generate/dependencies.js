const log = require('../log');
const terminal = require('../server/terminal');
const projectPaths = require('../paths').project;
const path = require('path');
const progress = require('../progress');

module.exports = function() {

    terminal()
        .then(function(servers) {
            var utilityPath = path.join(
                projectPaths.portalWebsite, 'utilities/dependencies'
            );

            require(utilityPath)({
                    locals: servers.webPortal.locals,
                    log: console.log,
                    progress: progress
                })
                .run()
                .then(function() {
                    log.success('Success!');
                });

        })
        .then(function() {
            log.success('Dependencies are loaded');
        });
};

var projectPaths = require('../paths').project;
var start = require('../start');
var path = require('path');
var server = require(path.join(projectPaths.services));
var log = require('../log');

module.exports = function(name) {

    var services = server({
        env: 'production',
        listenDisabled: true,
        dir: projectPaths.portal,
        include: path.join(projectPaths.project, 'services')
    });

    services.init();
    services.locals.app.once('booted', function() {

        log.info('Started services...');

        var compomnent = start.pages({
            mode: 'default',
            locals: {
                services: services.locals.app
            }
        });

        compomnent.init().then(function(locals) {
            var utilities = locals.project.utilities;
            var utility = utilities[name];
            if (!utility) {
                log.warn('Could not find utility: ' + name);
                return;
            }
            return utility.runner({
                locals: locals,
                log: console.log
            }).run();

        })
        .then(function(){
          log.success('Utility run was successful');
        });

    });

};

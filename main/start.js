const _ = require('lodash');
const log = require('./log');
const paths = require('./paths');
const projectPaths = paths.project;
const config = require('./config');
const Promise = require('bluebird');

var start = {
    init: function(subApps) {
        return Promise.each(subApps, function(component) {
                log.info('Initiating: ' + component.locals.app.get('title'));
                if (component.init) {
                    return component.init();
                }
            })
            .then(function() {
                return Promise.each(subApps, function(component) {
                    log.info('Starting: ' + component.locals.app.get('title'));
                    if (component.start) {
                        return component.start();
                    }
                });
            });
    },
    default: function() {

        return start.pages({
            mode: 'default'
        });

    },
    portal: function(locals) {

        return start.pages({
            mode: 'preview',
            dir: projectPaths.portalWebsite,
            locals: locals
        });
    },
    website: function(locals) {

        return start.pages({
            mode: 'preview',
            sync: true,
            locals: locals
        });
    },
    pages: function(options) {

        options.locals = options.locals || {};
        options.paths = paths.get(options);

        _.extend(options.locals, config);

        var result = require(options.paths.framework)(options);
        return result;
    },
    services: function(options) {

        return require(projectPaths.services)(options);

    }
};

module.exports = start;

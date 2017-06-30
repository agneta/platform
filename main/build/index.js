var projectPaths = require('../paths').project;
var path = require('path');
var _ = require('lodash');
var log = require('../log');
var start = require('../start');
var config = require('../config');
var server = require(path.join(projectPaths.services));

module.exports = function() {

    var pages = start.pages({
        paths: projectPaths,
        mode: 'build',
        locals: _.extend({}, config, {
            build: {
                assets: true,
                pages: true
            },
            track: {
                views: true
            }
        })
    });

    var services = start.services({
        listenDisabled: true,
        dir: projectPaths.portal,
        include: path.join(projectPaths.project, 'services')
    });

    services.locals.client =  pages.locals;
    services.locals.web =  pages.locals;

    pages.locals.services =  services.locals.app;
    pages.locals.portal =  services.locals.app;

    start.init([
        services,
        pages
    ]);

};

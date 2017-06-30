var fs = require('fs-extra');
var Promise = require('bluebird');
var projectPaths = require('../paths').project;
var outputFile = Promise.promisify(fs.outputFile);
var log = require('../log');
var start = require('../start');
var generator = require('loopback-sdk-angular');
var path = require('path');
var _ = require('lodash');

module.exports = function() {

    var server = require(path.join(projectPaths.services));
    var webPages = start.default();
    var webPortal = start.default();

    var commonOptions = {
        listenDisabled: true,
        client: webPages.locals
    };

    var servicesPortal = server(_.extend({
        dir: projectPaths.portal,
        include: path.join(projectPaths.project, 'services')
    }, commonOptions));

    var servicesWebsite = server(_.extend({
        dir: projectPaths.project
    }, commonOptions));

    servicesPortal.locals.web = webPages.locals;

    webPages.locals.portal = servicesPortal.locals.app;
    webPages.locals.services = servicesWebsite.locals.app;

    webPortal.locals.web = webPages.locals;
    webPortal.locals.services = servicesPortal.locals.app;

    var subApps = [
      servicesWebsite,
        servicesPortal,
        webPages,
        webPortal
    ];

    return start.init(subApps)
        .then(function() {
            return {
                servicesPortal: servicesPortal,
                servicesWebsite: servicesWebsite,
                webPages: webPages,
                webPortal: webPortal
            };
        });

};

var projectPaths = require('../paths').project;
var config = require('../config');
var start = require('../start');
var server = require(projectPaths.services);
var Promise = require('bluebird');

var webPages = require(projectPaths.framework)({
    paths: projectPaths,
    mode: 'default',
    locals: {
        load: {
            media: false,
            pages: {
                fields: {
                    title: true,
                    authorization: true,
                    path: true
                },
                exclude: {
                    pages: true,
                    viewData: true,
                    sidebar: true
                }
            }
        },
        host: config.host
    }
});

var services = server({
    dir: projectPaths.project,
    client: webPages.locals
});

webPages.locals.services = services.locals.app;

return start.init([
    services,
    webPages
]);

var url = require('url');
var _ = require('lodash');
var path = require('path');
var error = require('./error');

var projectPaths = require('./paths').project;
var projectOptions;

var env = process.env.NODE_ENV || 'development';

try {
    projectOptions = require(path.join(projectPaths.project, 'config'));
} catch (e) {
    projectOptions = {};
}

projectOptions = projectOptions[env] || {};

_.extend(projectOptions, {
    port: 8080,
    protocol: 'http',
    hostName: 'localhost'
});

var port = parseFloat(process.env.PORT || projectOptions.port);
var protocol = process.env.PROTOCOL || projectOptions.protocol;
var hostName = process.env.HOST_NAME || projectOptions.hostName;

//-------------------------------------

if (process.env.APP_HOST) {
    var hostParsed = url.parse(process.env.APP_HOST);
    protocol = hostParsed.protocol;
    if (protocol) {
        protocol = protocol.split(':')[0];
    }
}

var host = process.env.APP_HOST ||
    process.env.HOST ||
    url.format({
        protocol: protocol,
        hostname: hostName,
        port: port
    });

process.env.WEBSITE = host;

//-------------------------------------

if (!port) {
    error.config(port, 'PORT');
}

module.exports = _.extend(projectOptions, {
    port: port,
    host: host,
    protocol: protocol,
    env: env,
    hostName: hostName,
    socket: {
        path: '/socket'
    },
});

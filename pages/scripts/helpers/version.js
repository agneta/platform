var path = require('path');
var url = require('url');
var _ = require('lodash');
var urljoin = require('url-join');
var request = require('request-promise');
var chalk = require('chalk');

module.exports = function(locals) {

    var project = locals.project;
    var defaultTime = new Date();

    project.extend.helper.register('getVersion', function(url, time) {

        time = time || defaultTime;

        if (_.isString(time)) {
            version = time;
        }

        if (time.valueOf) {
            version = time.valueOf();
        }

        if (!url) {
            return version;
        }

        return urljoin(
            url,
            '?version=' + version
        );

    });

};

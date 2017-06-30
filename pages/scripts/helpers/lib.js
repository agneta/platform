const path = require('path');
const url = require('url');
const _ = require('lodash');
const urljoin = require('url-join');
const request = require('request-promise');
const chalk = require('chalk');
const LRU = require("lru-cache");

const cache = LRU({
    maxAge: 3 * 60 * 1000,
});

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('get_lib', function(libPath) {

        var basePath;
        var local;

        switch (project.env) {
            case 'development':
                if (!locals.web && process.env.LIB_LOCAL) {
                    local = true;
                    basePath = this.url_for('lib');
                }
                break;
        }

        if (!basePath) {
            basePath = project.site.servers.lib;
        }

        var result = urljoin(basePath, libPath);

        if (!local) {

            if (!cache.get(result)) {

                cache.set(result, true);

                request({
                        method: 'HEAD',
                        uri: result
                    })
                    .catch(function(err) {
                        console.log(chalk.bgRed('LIB_ERROR ' + err.statusCode), result);
                    });
            }

        }

        return this.getVersion(result);

    });

};

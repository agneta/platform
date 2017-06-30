var path = require('path');
var Promise = require('bluebird');
var deleteEmpty = Promise.promisify(require('delete-empty'));
var ProgressBar = require('progress');

var buildAssets = require('./assets');
var buildPages = require('./pages');
var deleteOld = require('./delete_old');
var exportFile = require('./export');

module.exports = function(locals) {

    return function(options) {

        options = options || {};
        options.logger = options.logger || console;
        options.progress = options.progress || function(length) {
            return new ProgressBar('[:bar] :percent', {
                total: length
            });
        };

        var config = options.config || locals.buildOptions;

        return Promise.resolve()
            .then(function() {

                exportFile(locals);

                if (config.assets) {
                    return buildAssets(locals, options);
                }

            })
            .then(function() {

                if (config.pages) {
                    return buildPages(locals, options);
                }

            })
            .then(function() {

                return deleteOld(locals, options);

            })
            .then(function() {

                return deleteEmpty(locals.build_dir);

            })
            .then(function() {

                options.logger.success('Building Complete!');

            });

    };
};

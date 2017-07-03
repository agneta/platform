const Promise = require('bluebird');
const deleteEmpty = Promise.promisify(require('delete-empty'));
const ProgressBar = require('progress');

const buildAssets = require('./assets');
const buildPages = require('./pages');
const deleteOld = require('./delete_old');
const exportFile = require('./export');

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

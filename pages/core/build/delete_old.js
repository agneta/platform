const path = require('path');
const Promise = require('bluebird');
const fs = require('fs-extra');
const klaw = require('klaw');

module.exports = function(locals, options) {

    var logger = options.logger;
    var exportFile = locals.exportFile;
    var walker = klaw(locals.build_dir);
    var deletePaths = [];

    ////////////////////////////////////////////////////////
    // LOAD PROCESS PROJECT DATA - SETUP
    ////////////////////////////////////////////////////////

    walker.on('data', function(item) {

        var pathCheck = path.relative(locals.build_dir, item.path);

        if (!pathCheck.length) {
            return;
        }

        if (item.stats.isDirectory()) {
            return;
        }
        if (exportFile.dictFile[pathCheck]) {
            return;
        }

        deletePaths.push(item.path);

    });

    return new Promise(function(resolve, reject) {

        walker.on('end', function() {

            Promise.map(deletePaths, function(deletePath) {

                    logger.log("Deleting path: " + deletePath);
                    return Promise.promisify(fs.remove)(deletePath);

                })
                .then(resolve);

        });

        walker.on('error', reject);

    });
};

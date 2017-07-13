var Promise = require('bluebird');
var fs = require('fs-extra');
var path = require('path');

module.exports = function(locals) {

    var dictFile = {};

    function init(options) {

        var filePath = path.join(options.container, options.path);
        var outputFilePath = path.join(locals.build_dir, filePath);

        dictFile[filePath] = true;

        if (options.data) {
            return fs.outputFile(
                outputFilePath,
                options.data);
        }

        if (options.sourcePath) {
            return fs.stat(outputFilePath)
                .then(function(outputStat) {
                    if (outputStat) {
                        return fs.stat(options.sourcePath)
                            .then(function(sourceStat) {
                                if (sourceStat.size == outputStat.size) {
                                    return true;
                                }
                            });
                    }
                })
                .catch(function(err) {
                    if (err.code == 'ENOENT') {
                        return false;
                    }
                    throw err;
                })
                .then(function(skip) {
                    if (skip) {
                        return;
                    }
                    return fs.copy(options.sourcePath, outputFilePath);
                });
        }

        console.log(options);
        return Promise.reject(new Error('Not correct format for: ' + outputFilePath));

    }

    locals.exportFile = {
        dictFile: dictFile,
        init: init
    };
};

var Promise = require('bluebird');
var fs = require('fs-promise');
var path = require('path');

module.exports = function(locals) {

    var dictFile = {};

    function init(options) {

        var filePath = options.path;

        dictFile[filePath] = true;

        var outputFilePath = path.join(locals.build_dir, filePath);


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

        return Promise.reject(new Error('Not correct format for: ' + outputFilePath));

    }

    locals.exportFile = {
        dictFile: dictFile,
        init: init
    };
};

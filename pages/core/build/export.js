/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/build/export.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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

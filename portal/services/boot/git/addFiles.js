/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/addFiles.js
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
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');
var fs = require('fs-extra');

module.exports = function(app) {

    app.git.addFiles = function(files) {

        var repo = app.git.repository;

        return repo.refreshIndex()
            .then(function(index) {

                if (!files) {
                    files = [];
                }

                return Promise.map(files, function(file) {
                        file = app.git.getPath(file);
                        return index.addByPath(file);
                    })
                    .then(function() {
                        return index.write();
                    })
                    .then(function() {
                        return index.writeTree();
                    });
            });

    };

};

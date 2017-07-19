/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/status.js
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

module.exports = function(app) {

    app.git.status = function() {

        var repo = app.git.repository;

        return app.git.addAll()
            .then(function() {
                return repo.getStatus();
            })
            .then(function(statuses) {

                function statusToText(status) {
                    var words = [];

                    if (status.isNew()) {
                        words.push({
                            code: "N",
                            color: '#00b111',
                            title: "New"
                        });
                    }

                    if (status.isModified()) {
                        words.push({
                            code: "M",
                            color: '#9000b1',
                            title: "Modified"
                        });
                    }

                    if (status.isTypechange()) {
                        words.push({
                            code: "T",
                            color: '#0065b1',
                            title: "TypeChange"
                        });
                    }

                    if (status.isRenamed()) {
                        words.push({
                            code: "R",
                            color: '#00b7a1',
                            title: "Renamed"
                        });
                    }

                    if (status.isIgnored()) {
                        words.push({
                            code: "I",
                            color: '#b16d00',
                            title: "Ignored"
                        });
                    }

                    if (status.isDeleted()) {
                        words.push({
                            code: "D",
                            color: '#de2d00',
                            title: "Deleted"
                        });
                    }

                    return words;
                }

                return Promise.map(statuses, function(file) {
                    return {
                        path: file.path(),
                        status: statusToText(file)
                    };
                });

            });

    };

};

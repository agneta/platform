/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/scripts/edit-data.js
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
var fs = require('fs-extra');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;
    var webPrj = locals.web.project;
    var editConfigDir = path.join(webPrj.paths.project, 'edit', 'data');

    project.on('ready', function() {

        if (!fs.existsSync(editConfigDir)) {

            project.editDataConfig = [];
            return;

        }

        var files = fs.readdirSync(editConfigDir);
        var result = [];

        for (var filename of files) {

            var filenameParsed = path.parse(filename);
            if (filenameParsed.ext != '.yml') {
                continue;
            }

            var config = _.extend({
                    name: filenameParsed.name
                },
                yaml.safeLoad(
                    fs.readFileSync(
                        path.join(editConfigDir, filename)
                    )
                )
            );

            result.push(config);
        }

        project.editDataConfig = result;
    });

};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/edit/loadTemplate.js
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
const fs = require('fs-extra');
const yaml = require('js-yaml');
const _ = require('lodash');

module.exports = function(options) {

    var web = options.app.get('options').web;
    var webHelpers = web.app.locals;

    return fs.readFile(options.path)
        .then(function(content) {

            var template = yaml.safeLoad(content);

            function scan(collection) {

                for (var key in collection) {
                    var field = collection[key];

                    if (_.isString(field)) {
                        var name = field;
                        field = getField(field);
                        field.name = name;
                        collection[key] = field;
                    }

                    if (_.isObject(field)) {
                        if (field.extend) {
                            _.defaults(field, getField(field.extend));
                            field.name = field.extend;
                            delete field.extend;
                        }
                    }

                    if (field.fields) {
                        scan(field.fields);
                    }
                }
            }

            function getField(field) {
                return webHelpers.get_data('edit/fields/' + field);
            }

            scan(template.fields);
            template.title = options.app.lng(template.title, options.req);
            return template;

        });

};

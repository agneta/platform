/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/search/init.js
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
var Promise = require("bluebird");
var _ = require("lodash");

module.exports = function(app) {

    return function(options) {

        var models = {
            source: app.models[options.models.source],
            field: app.models[options.models.field],
            keyword: app.models[options.models.keyword],
            position: app.models[options.models.position]
        };

        require('./methods_keyword')(models.keyword,app,models);
        require('./methods_source')(models.source,app,models);

    };

};

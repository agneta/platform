/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/models/page.js
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
var Schema = require('warehouse').Schema;
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var Moment = require('./types/moment');
var CacheString = require('./types/cachestring');

function pickID(data) {
    return data._id;
}

module.exports = function(ctx) {

    var basePath = pathFn.relative(ctx.paths.base, ctx.paths.source);

    var Model = new Schema({
        id: String,
        title: {
            type: Object,
            required: true
        },
        source: {
            type: String,
            required: false
        },
        path: {
            type: String,
            required: true
        }
    });

    Model.virtual('full_source').get(function() {
        return pathFn.join(basePath, this.source || '');
    });

    return Model;
};

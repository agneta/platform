/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/cache/data.js
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
const path = require('path');
const LRU = require("lru-cache");

module.exports = function(locals) {

    var project = locals.project;

    const dirs = LRU();
    const files = LRU({
        max: 20 * 1000,
        length: function(item) {
            return item.$size;
        }
    });

    locals.cache.data = {
        dirs: dirs,
        files: files,
        invalidate: function() {
            files.reset();
            dirs.reset();
        }
    };

};

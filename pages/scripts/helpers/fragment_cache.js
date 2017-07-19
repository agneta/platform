/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/fragment_cache.js
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
'use strict';

module.exports = function(locals) {

    var project = locals.project;
    var cache = {};

    function fragmentCache(id, fn) {
        if (this.cache && cache[id] != null) return cache[id];

        var result = cache[id] = fn();
        return result;
    }

    project.extend.helper.register('fragment_cache', fragmentCache);

};

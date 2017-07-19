/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/text.js
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
var md5 = require('md5');

module.exports = function(locals) {

    var project = locals.project;

    /////////////////////////////////////////////////////////////////
    // Truncate text at length and add three dots (...)
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('slice_text', function(str, len) {
        if (str.length > len) {
            str = str.slice(0, len);
        }
        str += '...';
        return str;
    });

    /////////////////////////////////////////////////////////////////
    // Capitalize first character in string
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('capitalize_first', function(string) {
        if (!string)
            return;
        return string.charAt(0).toUpperCase() + string.slice(1);
    });

    project.extend.helper.register('md5', function(string) {
        return md5(message);
    });

}

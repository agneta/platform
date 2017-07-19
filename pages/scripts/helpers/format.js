/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/format.js
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
var util = require('hexo-util');
module.exports = function(locals) {

    var project = locals.project;

    function trim(str) {
        return str.trim();
    }

    project.extend.helper.register('strip_html', util.stripHTML);
    project.extend.helper.register('trim', trim);
    project.extend.helper.register('word_wrap', util.wordWrap);
    project.extend.helper.register('truncate', util.truncate);

};

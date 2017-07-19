/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/code.js
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
var path = require('path');
var _ = require('lodash');
var hljs = require('highlight.js');

module.exports = function(locals) {

    var project = locals.project;

    hljs.configure({
      classPrefix: 'hljs-'
    });

    project.extend.helper.register('code', function(name, value) {

        var result = hljs.highlight(name, value);
        result = '<div class="hljs">' + result.value + '</div>';
        return result;
    });

};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/scripts.js
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
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('loadScripts', function() {

        var lines = [];

        lines.push(this.js('lib/angular.min'));

        //------------------------------

        var arr;
        var angularDeps = "";
        var angular_libs = this.config.angular_libs;

        //-------------------------------

        arr = _.uniqBy(angular_libs,'js');

        for (var lib of arr) {

            if (angularDeps.length) {
                angularDeps += ',';
            }

            if (lib.dep) {
                angularDeps += "'" + lib.dep + "'";
            }

            lines.push(this.js(lib.js));
        }

        //-------------------------------
        arr = _.uniq(this.config.scripts);

        for (var script of arr) {
            lines.push(this.js(script));
        }

        return {
            angularDeps: angularDeps,
            lines: lines.join('\n')
        };
    });

};

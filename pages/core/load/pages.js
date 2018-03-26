/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/load/pages.js
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

  locals.renderData = function(data) {

    var data_render = _.extend({
      page: data
    });

    data.__scripts = data.scripts || [];
    data.__styles = data.styles || [];

    var body = locals.app.locals.template('page', data_render);
    data_render.body = body;

    return locals.app.locals.template('layout', data_render);
  };

  return function() {

    return require('../generators')(locals)
      .catch(function(err) {
        console.error(err);
        console.error(err.stack);
      })
      .then(function() {
        //console.log('Loaded all pages');
      });
  };

};

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

  var commonData = {};
  var page = locals.page = {};

  page.commonData = function(page) {

    var key = page.pathSource || page.path;
    var data = commonData[key] || (commonData[key] = {});
    _.defaults(data,{
      scripts: [],
      styles: []
    });
    return data;
  };

  page.renderData = function(data) {

    let helpers = locals.app.locals;
    let data_render = _.extend({
      page: data
    });

    let body = helpers.template('page', data_render);
    data_render.body = body;

    return helpers.template('layout', data_render);

  };

  return function() {
    commonData = {};
    return require('../generators')(locals)
      .catch(function(err) {
        console.log('Generator Error (check logs): ',err.message);
        console.error();
        return Promise.reject(err);
      })
      .then(function() {
      //console.log('Loaded all pages');
      });
  };

};

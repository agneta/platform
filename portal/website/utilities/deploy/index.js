/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/index.js
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

const Sync = require('./sync');
const Pages_DB = require('./pages_db');
const Search = require('./search');
const Promise = require('bluebird');

module.exports = function(util) {

  var sync = Sync(util);
  var pages_db = Pages_DB(util);
  var search = Search(util);

  return {
    run: function(options) {

      options.promote = options.promote || {};
      options.stage = options.stage || {};

      return Promise.resolve()
        .then(function() {
          return pages_db(options);
        })
        .then(function() {
          return sync(options);
        })
        .then(function() {
          return search(options);
        });

    },
    parameters: require('./parameters')
  };

};

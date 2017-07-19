/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/search/index.js
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
var Promise = require('bluebird');
var path = require('path');

const Keywords = require('./lib/keywords');

module.exports = function(util) {

  Keywords(util, {
    model: {
      keyword: 'Search_Keyword',
      source: 'Search_Page'
    },
    filename: function(options) {
      return 'keywords_' + options.language;
    },
    title: 'path'
  });

  var result;

  return {
    run: function() {

      return require('./lib/generate')(util);

    }
  };


};

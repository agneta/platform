/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/pages/search.js
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

const _ = require('lodash');
const Promise = require('bluebird');
const Keywords = require('../keywords');
const searchPages = require('./search-pages');

module.exports = function(util) {

  Keywords(util, {
    name: 'page',
    filename: function(options) {
      return 'keywords_' + options.language;
    },
    title: 'path'
  });

  var locals = util.locals;
  var web = locals.web.project;
  var pages = web.site.pages.find().toArray();

  return util.keywords.clear()
    .then(function() {
      return Promise.map(_.keys(web.site.languages), function(language) {
        language = language.value;
        web.site.lang = language;
        return searchPages({
          util: util,
          pages: pages,
          language: language
        });

      }, {
        concurrency: 1
      });
    })
    .then(function(data) {
      return {
        languages: data
      };
    });

};

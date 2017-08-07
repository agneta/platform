/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/lib/keywords/deploy.js
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
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(util, options) {

  var Page = util.locals.services.models[options.model.source];

  return function(data) {

    util.log('Clearing existing search data...');

    function deployItems(pages, options) {
      options = options || {};

      var bar = util.progress(pages.length, {
        title: options.title || `Uploading keywords for ${pages.length} search items`
      });

      return Promise.map(pages, function(page) {
        return Page.add(page)
          .then(function() {
            bar.tick({
              title: _.get(page, 'title.value')
            });
          });

      }, {
        concurrency: 5
      });

    }


    if (_.isArray(data)) {
      return deployItems(data);
    }

    return Promise.map(data.languages, function(language) {

      util.log('[' + language.key + ']: Uploading ' + language.pages.length + ' pages...');

      return deployItems(language.pages, {
        title: 'Uploading keywords for language: ' + language.key
      });
    }, {
      concurrency: 1
    });

  };
};

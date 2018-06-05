/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/pages/db.js
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
module.exports = function(util) {

  var webProject = util.locals.web.project;
  var services = util.locals.services;
  var Page = services.models.Page;

  var pickProps = [
    'title',
    'path',
    'source',
    'template',
    'authorization',
    'isView',
    'isViewData',
    'date'
  ];

  return {

    production: function() {

      return require('../transfer/database')(util, {
        source: services.models.Page,
        target: services.models.Production_Page,
        key: 'path'
      });

    },

    staging: function() {

      var pages = webProject.site.pages.find({
        isView: undefined,
        isViewData: undefined
      }).toArray();

      var bar = util.progress(pages.length, {
        title: `Deploy ${pages.length} page to database`
      });

      return Promise.map(pages, function(page) {

        var pageProps = _.pick(page, pickProps);

        return Page.findOne({
          where: {
            path: pageProps.path
          }
        }).then(function(page) {

          if (!page) {
            return Page.create(pageProps);
          }

          return page.updateAttributes(pageProps);

        }).then(function() {
          bar.tick();
        });

      });

    }
  };

};

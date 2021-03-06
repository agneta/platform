/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/get.js
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
const urljoin = require('url-join');
const path = require('path');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(locals) {
  var project = locals.project;

  locals.app.get('/', function(req, res) {
    var url =
      '/' + urljoin(project.config.root, project.config.language.default.key);
    url = path.normalize(url);
    res.redirect(url);
  });

  locals.app.get('/:lang*', function(req, res, next) {
    var target = req.params[0];
    var lang = req.params.lang;
    Promise.resolve()
      .then(function() {
        return locals.app.renderPage(target, lang);
      })
      .then(function(content) {
        if (!content) {
          return next();
        }

        res.send(content);
      })
      .catch(next);
  });

  locals.app.renderPage = function(target, lang) {
    return Promise.resolve()
      .then(function() {
        var languages = _.get(project, 'site.languages');
        if (!languages) {
          return;
        }

        var language = languages[lang];

        if (!language) {
          return;
        }

        project.site.lang = lang;

        if (_.isString(target)) {
          return project.getPage(target).then(function(page) {
            //console.log('page', target, page);
            return page.data;
          });
        }

        if (_.isObject(target)) {
          return target;
        }
      })
      .then(function(data) {
        //console.log(data);
        if (!data) {
          //throw new Error('No Data found for ' + target);
          return;
        }

        //-----------------------------------------------------------

        if (data.if && !project.config[data.if]) {
          //throw new Error('Page does not meet condition');
          return;
        }

        //-----------------------------------------------------------
        return locals.page.renderData(data);
      });
  };
};

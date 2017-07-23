/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/search/lib/generate.js
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
var Promise = require('bluebird');
var cheerio = require('cheerio');
var urljoin = require('url-join');

module.exports = function(util) {

  var locals = util.locals;
  var web = locals.web.project;
  var webApp = locals.web.app;

  var pages = web.site.pages.find().toArray();

  return util.keywords.clear()
    .then(function() {
      return Promise.map(_.keys(web.site.languages), function(language) {

        web.site.lang = language;
        var _pages = [];

        var bar = util.progress(pages.length, {
          title: 'Extract keywords from pages for language: ' + language
        });

        return Promise.map(pages, function(page) {

          return Promise.resolve()
            .delay(60)
            .then(function() {

              if (page.barebones) {
                return;
              }

              if (page.skip) {
                return;
              }

              if (page.searchDisabled) {
                return;
              }
              return webApp.renderPage(urljoin(page.path, 'view'), web.site.lang)
                .then(function(html) {
                  console.log(urljoin(page.path, 'view'),html);
                  if (!html) {
                    return;
                  }

                  var $ = cheerio.load(html, {
                    decodeEntities: false
                  });

                  var title = webApp.locals.lng(page.title);
                  var description = webApp.locals.lng(page.description);
                  var elements = $('*').not('a, h1, script');
                  var content = [];

                  elements.each(function() {
                    var $this = $(this);

                    if ($this.children().length) {
                      return;
                    }

                    var text = $this
                      .text()
                      .replace(/\{\{(?:(?!}})[\S\s])*?\}\}/g, ''); // Remove Template Tags
                    var field = util.keywords.scan(text, 'content');
                    if (!field) {
                      return;
                    }
                    content.push(field);

                  });

                  var _page = {
                    title: util.keywords.scan(title, 'title'),
                    description: util.keywords.scan(description, 'description'),
                    path: '/' + urljoin(language, page.path),
                    content: content,
                    language: language
                  };

                  _pages.push(_page);

                });


            })
            .then(function() {
              bar.tick({
                title: page.path
              });
            });

        }, {
          concurrency: 3
        }).then(function() {

          return Promise.all([
            util.keywords.deploy(_pages),
            util.keywords.json({
              language: language
            })
          ]);

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

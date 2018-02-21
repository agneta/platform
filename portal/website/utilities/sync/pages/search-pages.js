/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/pages/search-pages.js
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
const cheerio = require('cheerio');
const urljoin = require('url-join');

module.exports = function(options) {

  let util = options.util;
  let pages = options.pages;
  let language = options.language;

  let locals = util.locals;
  let web = locals.web.project;
  let webApp = locals.web.app;

  let bar = util.progress(pages.length, {
    title: 'Extract keywords from pages for language: ' + language
  });
  let _pages = [];

  return Promise.map(pages, searchPage, {
    concurrency: 3
  }).then(function() {

    return Promise.all([
      util.keywords.deploy(_pages),
      util.keywords.json({
        language: language
      })
    ]);

  });

  function searchPage(page) {

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

            let $ = cheerio.load(html, {
              decodeEntities: false
            });

            let title = webApp.locals.lng(page.title);
            let description = webApp.locals.lng(page.description);
            let elements = $('*').not('a, h1, script');
            let content = [];

            elements.each(function() {
              let $this = $(this);

              if ($this.children().length) {
                return;
              }

              let text = $this
                .text()
                .replace(/\{\{(?:(?!}})[\S\s])*?\}\}/g, ''); // Remove Template Tags
              let field = util.keywords.scan(text, 'content');
              if (!field) {
                return;
              }
              content.push(field);

            });

            let _page = {
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

  }
};

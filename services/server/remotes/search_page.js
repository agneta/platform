/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/search_page.js
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

module.exports = function(Model, app) {

  require('../mixins/disableAllMethods')(Model);

  Model.validatesUniquenessOf('path');

  Model.add = function(data) {

    var attributes = {
      //
      title: data.title.value,
      title_keywords: Model._getKeywords(data.title.positions),
      //
      path: data.path,
      lang: data.language
    };

    var fields = [].concat(data.title);

    if (data.description) {
      attributes.description = data.description.value;
      attributes.description_keywords = Model._getKeywords(data.description.positions);

      fields = fields.concat(data.description);
    }

    if (data.content) {

      var content = _.map(data.content, 'value');
      var content_keywords = _.reduce(data.content, function(result, value) {
        return result.concat(value.positions);
      }, []);

      content_keywords = Model._getKeywords(content_keywords);

      attributes.content = content;
      attributes.content_keywords = content_keywords;

      fields = fields.concat(data.content);
    }

    return Model._add({
      where: {
        path: data.path
      },
      fields: fields,
      attributes: attributes,
      language: data.language
    });

  };

  Model.search = function(text, keywords, req) {

    var result;
    return Model.engine.find({
      keywords: keywords,
      language: req.query.language,
      fields: {
        title_keywords: false,
        description_keywords: false,
        content: false,
        content_keywords: false
      }
    })
      .then(function(_result) {

        result = _result;

        if (!result.items) {
          return;
        }

        var pages = result.items;

        if (!req.session) {
          return;
        }

        var feeds = [];
        var value;
        //console.log(req.session);

        req.session.searchPages = req.session.searchPages || {};

        for (var page of pages) {
          value = app.helpers.slugifyPath(page.path);
          if (req.session.searchPages[value]) {
            continue;
          }
          req.session.searchPages[value] = true;
          feeds.push({
            value: value,
            type: 'search_page'
          });
        }

        // Keywords

        req.session.searchKeywords = req.session.searchKeywords || {};

        for (var keyword of keywords) {
          value = keyword.value || keyword;
          if (req.session.searchKeywords[value]) {
            continue;
          }
          req.session.searchKeywords[value] = true;
          feeds.push({
            value: value,
            type: 'search_keyword'
          });
        }

        if (feeds.length) {

          //console.log('About to create', feeds);

          var options = {
            feeds: feeds,
            action: 'search',
            req: req,
            data: {
              text: text
            }
          };

          app.models.Activity_Item.new(options);

        }
      })
      .then(function() {
        return result;
      });
  };


};

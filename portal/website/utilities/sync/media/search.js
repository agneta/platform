/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/media/search.js
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
const Keywords = require('../keywords');

module.exports = function(util, options) {

  var limit = 200;

  var where = {
    isSize: false
  };

  var bar;
  var searchItems = [];
  var count;

  var keywords = Keywords(util, {
    name: 'media',
    filename: function() {
      return 'keywords_media';
    },
    title: 'location.value',
    outputJson: util.locals.project.paths.appPortal.generated
  });

  function getItems(skip) {

    skip = skip || 0;
    return options.model.find({
      where: where,
      fields: {
        id: true,
        location: true
      },
      limit: limit,
      skip: skip
    })
      .then(function(objects) {
        return Promise.map(objects, function(object) {

          bar.tick({
            title: object.location
          });

          searchItems.push({
            location: keywords.scan(object.location, 'title')
          });

        });
      })
      .then(function() {
        var _skip = skip + limit;
        if (count <= _skip) {
          return;
        }
        return getItems(_skip);
      });

  }

  return options.model.count(where)
    .then(function(_count) {
      count = _count;
      bar = util.progress(count, {
        title: 'Scanning media search items'
      });

      return getItems();
    })
    .then(function() {
      return Promise.all([
        keywords.deploy(searchItems),
        keywords.json()
      ]);
    });

};

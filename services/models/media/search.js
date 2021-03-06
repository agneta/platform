/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/search.js
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

module.exports = function(Model) {

  Model.search = function(text, keywords) {

    var result;

    return Model.engine.find({
      keywords: keywords,
      where: {
        isSize: false
      },
      fields: {
        location_keywords: false,
      }
    })
      .then(function(_result) {
        result = _result;
        return Promise.map(result.items, function(item) {
          return Model.__prepareObject(item);
        });
      })
      .then(function(items) {
        result.items = items;
        return result;
      });

  };

};

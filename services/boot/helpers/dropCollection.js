/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/helpers/dropCollection.js
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

module.exports = function(app) {

  return function(names) {

    names = _.isArray(names) ? names : [names];

    var db = app.dataSources.db.connector.db;

    return Promise.resolve()
      .then(function() {
        return db.listCollections()
          .toArray();
      })
      .then(function(list) {
        return Promise.map(names, function(name) {

          if (_.find(list, {
            name: name
          })) {
            return db.collection(name).drop();
          }

        });
      })
      .then(function() {
        return app.indexes.autoupdate(names);
      });

  };
};

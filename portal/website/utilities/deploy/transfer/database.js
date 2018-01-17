/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/lib/sync/database.js
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

  var recordsProcessed = {};
  var limit = 50;

  return Promise.resolve()
    .then(function() {
      return options.source.count()
        .then(function(count) {

          var bar = util.progress(count, {
            title: `Syncing ${count} records on databases ${options.source.definition.name} -> ${options.target.definition.name}`
          });

          function load(skip) {

            return options.source.find({
              limit: limit,
              skip: skip
            })
              .then(function(records) {
                return Promise.map(records, function(record) {

                  var where = {};
                  var keyValue = record[options.key];

                  where[options.key] = keyValue;

                  return options.target.findOne({
                    where: where
                  })
                    .then(function(targetRecord) {

                      var props = _.omit(record.__data,['id']);

                      if (targetRecord) {
                        return targetRecord.updateAttributes(props);
                      }
                      return options.target.create(props);

                    })
                    .then(function() {
                      recordsProcessed[keyValue] = true;
                      bar.tick();
                    });
                }, {
                  concurrency: 10
                });
              })
              .then(function() {
                if (skip + limit < count) {
                  return load(skip + limit);
                }
              });
          }

          return load();


        });
    })
    .then(function() {

      return options.target.count()
        .then(function(count) {

          var bar = util.progress(count, {
            title: `Checking ${count} records on ${options.target.definition.name} for removal`
          });

          function load(skip) {

            var fields = {};
            fields[options.key] = true;

            return options.source.find({
              limit: limit,
              skip: skip,
              fields: fields
            })
              .then(function(records) {
                return Promise.map(records, function(record) {

                  return Promise.resolve()
                    .then(function() {
                      if (!recordsProcessed[record[options.key]]) {
                        return record.destroy();
                      }
                    })
                    .delay(10)
                    .then(function() {
                      bar.tick();
                    });

                }, {
                  concurrency: 10
                });
              })
              .then(function() {
                if (skip + limit < count) {
                  return load(skip + limit);
                }
              });
          }

          return load();

        });
    });
};

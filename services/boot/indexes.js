/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/indexes.js
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

  app.indexes = {
    autoupdate: function(names) {
      return Promise.map(names, function(name) {
        var Model = app.models[name];
        var dataSource = Model.dataSource;
        return dataSource.autoupdate(name);
      }, {
        concurrency: 1
      });
    },
    updateDatasources: function(names) {
      return Promise.map(names, function(name) {
        var datasource = app.datasources[name];
        if (datasource) {
          return datasource.autoupdate(_.keys(datasource.connector._models));
        }
      });
    }
  };

};

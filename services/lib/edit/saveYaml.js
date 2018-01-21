/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/edit/saveYaml.js
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
const lockFile = require('lockfile');
const Promise = require('bluebird');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const _ = require('lodash');

module.exports = function(app) {

  app.edit.saveYaml = function(filePath, data){

    data = _.omitDeep(data, ['undefined', '$$hashKey']);
    var lockPath = filePath + '.lockfile';

    return new Promise(function(resolve, reject) {

      lockFile.lock(lockPath, {}, function(err) {

        if (err) {
          return reject(err);
        }

        resolve();
      });
    })
      .then(function() {

        return fs.writeFile(filePath, yaml.safeDump(data));

      })
      .then(function() {


        return new Promise(function(resolve, reject) {

          lockFile.unlock(lockPath, function(err) {
            if (err) {
              return reject(err);
            }
            return resolve();
          });

        });

      });

  };
};

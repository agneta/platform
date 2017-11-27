/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/process/logs/rotate.js
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
const fs = require('fs-extra');
const Promise = require('bluebird');
const INTERVAL = 1000 * 30; // 30 Seconds
const SIZE_LIMIT = 1024 * 1024 * 10; // 10MB
const DATE_FORMAT = 'YYYY-MM-DD_HH-mm-ss';
const moment = require('moment');

module.exports = function(app) {

  function proceed(file) {

    return new Promise(function(resolve, reject) {

      var final_name = file.substr(0, file.length - 4) + '__' +
        moment().format(DATE_FORMAT) + '.log';

      var readStream = fs.createReadStream(file);
      var writeStream = fs.createWriteStream(final_name, {
        'flags': 'w+'
      });

      readStream.pipe(writeStream);

      readStream.on('end', function() {
        readStream.close();
        writeStream.close();

        fs.truncate(file)
          .then(resolve)
          .catch(reject);
      });

    });

  }


  var files;

  function findFiles() {
    return app.process.describe()
      .then(function(data) {
        var instance = data[0].pm2_env;

        app.process.logs.file = {
          output: instance.pm_out_log_path,
          error: instance.pm_err_log_path
        };

        files = [
          app.process.logs.file.output,
          app.process.logs.file.error
        ];

      });
  }

  return findFiles()
    .then(function() {
      function rotateCheck() {
        return Promise.map(files, function(filePath) {

          return fs.stat(filePath)
            .then(function(data) {

              if (data.size >= SIZE_LIMIT) {
                return proceed(filePath);
              }

            });
        })
          .then(function() {

            return Promise.delay(INTERVAL).then(rotateCheck);
          });
      }

      rotateCheck();

    });
};

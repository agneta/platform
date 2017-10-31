const fs = require('fs-extra');
const Promise = require('bluebird');
const INTERVAL = 1000 * 30; // 30 Seconds
const SIZE_LIMIT = 1024 * 1024 * 10; // 10MB
const pm2 = Promise.promisifyAll(require('pm2'));
const DATE_FORMAT = 'YYYY-MM-DD_HH-mm-ss';
const moment = require('moment');

module.exports = function() {

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

  pm2.connectAsync()
    .then(function() {

      var checkFiles = [];

      function findFiles() {
        return pm2.describeAsync('agneta')
          .then(function(data) {
            var instance = data[0].pm2_env;
            checkFiles = [
              instance.pm_out_log_path,
              instance.pm_err_log_path
            ];
          });
      }

      return findFiles()
        .then(function() {
          function rotateCheck() {
            return Promise.map(checkFiles, function(filePath) {

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

          return rotateCheck();

        });

    });

};

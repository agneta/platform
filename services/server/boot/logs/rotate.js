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

        app.logs.file = {
          output: instance.pm_out_log_path,
          error: instance.pm_err_log_path
        };

        files = [
          app.logs.file.output,
          app.logs.file.error
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

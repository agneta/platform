const lockFile = require('lockfile');
const Promise = require('bluebird');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const _ = require('lodash');

module.exports = function(filePath, data) {

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

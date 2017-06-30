var bower = require('bower');
var cli = require('bower/lib/util/cli');
var Promise = require('bluebird');

module.exports = function(util, path) {
    var originalDir = process.cwd();
    process.chdir(path);

    var logger = bower.commands.install();
    logger.on('log', function(log) {
        //renderer.log(log);
        util.log('[bower] ' + log.id + ' ' + log.message);
    });

    return new Promise(function(resolve, reject) {
            var renderer = cli.getRenderer('install', logger.json, bower.config);

            logger.once('end', function(data) {
                resolve(data);
            });
            logger.once('error', function(err) {
                reject(err);
            });
        })
        .then(function() {
            process.chdir(originalDir);
        });
};

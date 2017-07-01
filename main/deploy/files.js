const _ = require('lodash');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const Promise = require('bluebird');
const fs = require('fs-extra');
const klaw = require('klaw');

var ProgressBar = require('progress');

function sync(options) {

    var client = options.client;
    var pathSources = options.paths || [options.path];

    var filesSource = [];
    var filesDest;
    var filesDestTmp = {};
    var totalSizeSource = 0;
    var container;

    var filesUploaded = [];
    var filesSkipped = [];
    var filesDeleted = [];

    return new Promise(function(resolve, reject) {

        client.getContainer(options.bucket, function(err, _container) {

            if (err) {
                return reject(err);
            }

            container = _container;

            console.log();
            console.log('------------------------------------------');
            console.log('Container:', options.bucket);
            if (container.count) {
                console.log('Total Files:', container.count);
                console.log('Total Size:', prettyBytes(container.bytes));
            }
            console.log('------------------------------------------');

            client.getFiles(container, function(err, _filesDest) {

                if (err) {
                    return reject(err);
                }

                filesDest = _filesDest;

                Promise.map(filesDest, function(fileDest, index) {

                        filesDestTmp[fileDest.name] = index;
                    })
                    .then(function() {

                        return walkSourcePaths();
                    })
                    .then(resolve)
                    .catch(reject);
            });
        });
    });


    function walkSourcePaths() {

        return Promise.map(pathSources, function(pathSource) {
                return walkSourceFiles(pathSource);
            })
            .then(function() {

                var bar = new ProgressBar(':percent :path', {
                    total: filesSource.length
                });

                return Promise.map(filesSource, function(fileSource) {

                    var fileDest = filesDestTmp[fileSource.path];
                    delete filesDestTmp[fileSource.path];

                    if (fileDest) {

                        fileDest = filesDest[fileDest];


                        if (fileDest.size == fileSource.stats.size) {
                            filesSkipped.push(fileDest);
                            bar.tick({
                                path: ('SKIPPED: ' + fileSource.path)
                            });
                            return;
                        }

                    }

                    return new Promise(function(resolve, reject) {

                        var readStream = fs.createReadStream(fileSource.pathAbs);
                        var writeStream = client.upload({
                            container: container,
                            remote: fileSource.path
                        });

                        writeStream.on('error', function(err) {
                            reject(err);
                        });

                        writeStream.on('success', function(file) {
                            bar.tick({
                                path: fileSource.path
                            });
                            filesUploaded.push(file);
                            resolve();
                        });

                        readStream.pipe(writeStream);

                    });

                }, {
                    concurrency: 20
                });

            })
            .then(function() {

                var filesDelete = _.values(filesDestTmp);

                return Promise.map(filesDelete, function(index) {

                    var fileDelete = filesDest[index];

                    return new Promise(function(resolve, reject) {
                        client.removeFile(container, fileDelete, function(err, result) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            filesDeleted.push(fileDelete);
                            console.log('Deleted:', fileDelete.name);
                            resolve();
                        });
                    });
                });

            })
            .then(function() {

                console.log();
                console.log('------------------------------------------');
                console.log('Uploaded:', filesUploaded.length);
                console.log('Skipped:', filesSkipped.length);
                console.log('Deleted:', filesDeleted.length);
                console.log('------------------------------------------');
                console.log();

            })
            .catch(function(err) {
                console.error(err);
            });

    }

    function walkSourceFiles(pathSource) {
        return new Promise(function(resolve) {

            klaw(pathSource)
                .on('data', function(item) {

                    if (item.stats.isFile()) {

                        var pathRelative = path.relative(pathSource, item.path);

                        filesSource.push({
                            path: pathRelative,
                            pathAbs: item.path,
                            stats: item.stats
                        });

                        totalSizeSource += item.stats.size;
                    }

                })
                .on('end', function() {

                    console.log();
                    console.log('------------------------------------------');
                    console.log('Source:', pathSource);
                    console.log('Total Files:', filesSource.length);
                    console.log('Total Size:', prettyBytes(totalSizeSource));
                    console.log('------------------------------------------');
                    console.log();

                    resolve();
                });
        });

    }

}

module.exports = {
    sync: sync
};

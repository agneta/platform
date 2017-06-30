const _ = require('lodash');
const path = require('path');
const cleanArray = require('clean-array');
const prettyBytes = require('pretty-bytes');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const db = require('mime-db');
const mime = require('mime-type')(db);
const md5File = require('md5-file/promise');
const readChunk = require('read-chunk');
const fileType = require('file-type');

module.exports = function(util) {

    var services = util.locals.services;
    var storage = services.storage;
    var s3 = storage.s3;

    function sync(options) {

        var containerName = options.target;
        var pathSource = options.source;

        var filesSource = [];
        var filesDest = [];
        var filesDestTmp = {};
        var totalSizeSource = 0;

        var filesUploaded = [];
        var filesSkipped = [];
        var filesDeleted = [];

        return s3.listAllObjects({
                bucket: containerName,
                onData: function(files) {
                    filesDest = filesDest.concat(files);
                }
            })
            .then(function() {
                var totalSize = 0;
                return Promise.map(filesDest, function(fileDest, index) {
                        filesDestTmp[fileDest.Key] = index;
                        totalSize += fileDest.Size;
                    })
                    .then(function() {
                        return totalSize;
                    });
            })
            .then(function(totalSize) {

                util.log('------------------------------------------');
                util.log('Target Bucket:', containerName);
                util.log('Target Objects:', filesDest.length);
                util.log('Target Total Size:', prettyBytes(totalSize));
                util.log('------------------------------------------');

                return walkSourceFiles();
            });


        function walkSourceFiles() {
            return new Promise(function(resolve, reject) {

                    fs.walk(pathSource)
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

                            util.log('------------------------------------------');
                            util.log('Source Path:', pathSource);
                            util.log('Source Objects:', filesSource.length);
                            util.log('Source Total Size:', prettyBytes(totalSizeSource));
                            util.log('------------------------------------------');

                            resolve();
                        });
                })
                .then(function() {

                    var bar = util.progress(filesSource.length, {
                        title: 'Upload files'
                    });

                    return Promise.map(filesSource, function(fileSource) {

                        return Promise.resolve()
                            .delay(20)
                            .then(function() {

                                var fileDest = filesDestTmp[fileSource.path];
                                delete filesDestTmp[fileSource.path];

                                return Promise.resolve()
                                    .then(function() {

                                        if (fileDest) {
                                            fileDest = filesDest[fileDest];

                                            return md5File(fileSource.pathAbs)
                                                .then(function(hash) {
                                                    hash = '"' + hash + '"';
                                                    if (fileDest.ETag == hash) {
                                                        filesSkipped.push(fileDest);
                                                        return true;
                                                    }
                                                });

                                        }

                                    })
                                    .then(function(skip) {

                                        if (skip) {
                                            return;
                                        }

                                        var contentEncoding = null;
                                        var contentType = null;

                                        var readStream = fs.createReadStream(fileSource.pathAbs);
                                        var type = fileType(
                                            readChunk.sync(fileSource.pathAbs, 0, 4100)
                                        );

                                        if (type) {
                                            switch (type.ext) {
                                                case 'gz':
                                                    contentEncoding = 'gzip';
                                                    break;
                                            }
                                        }

                                        contentType = mime.lookup(
                                            path.parse(fileSource.pathAbs).ext
                                        );

                                        return s3.uploadAsync({
                                                Bucket: containerName,
                                                Key: fileSource.path,
                                                Body: readStream,
                                                ContentType: contentType,
                                                ContentEncoding: contentEncoding
                                            })
                                            .then(function(data) {
                                                filesUploaded.push(data);
                                            });

                                    });


                            })
                            .then(function() {
                                bar.tick({
                                    title: fileSource.path
                                });
                            });

                    }, {
                        concurrency: 20
                    });

                })
                .then(function() {

                    if (!options.deleteUnused) {
                        return;
                    }

                    var filesDelete = _.values(filesDestTmp);

                    return Promise.map(filesDelete, function(index) {

                        var fileDelete = filesDest[index];

                        return s3.deleteObjectAsync({
                                Bucket: containerName,
                                Key: fileDelete.Key
                            })
                            .then(function() {
                                filesDeleted.push(fileDelete);
                                util.log('Deleted:', fileDelete.Key);
                            });
                    });

                })
                .then(function() {

                    util.log('------------------------------------------');
                    util.log('Uploaded:', filesUploaded.length);
                    util.log('Skipped:', filesSkipped.length);
                    util.log('Deleted:', filesDeleted.length);
                    util.log('------------------------------------------');

                });
        }

    }

    return sync;
};

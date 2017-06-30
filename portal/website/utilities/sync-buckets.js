var _ = require('lodash');
var path = require('path');
var cleanArray = require('clean-array');
var prettyBytes = require('pretty-bytes');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var db = require('mime-db')
var mime = require('mime-type')(db)

module.exports = function(util) {

    var services = util.locals.services;
    var storage = services.storage;

    var s3 = storage.s3;

    function sync(options) {

        var bucketTarget = options.target;
        var bucketSource = options.source;

        var filesTarget = [];
        var filesTargetDict = {};
        var filesSource = [];
        var filesCopied = [];
        var filesSkipped = [];

        return s3.listAllObjects({
                bucket: bucketSource,
                onData: function(files) {
                    filesSource = filesSource.concat(files);
                }
            })
            .then(function() {
                var totalSize = 0;
                return Promise.map(filesSource, function(fileDest, index) {
                        totalSize += fileDest.Size;
                    })
                    .then(function() {
                        return totalSize;
                    });
            })
            .then(function(totalSize) {

                util.log('------------------------------------------');
                util.log('Source Bucket:', bucketSource);
                util.log('Source Objects:', filesSource.length);
                util.log('Source Total Size:', prettyBytes(totalSize));
                util.log('------------------------------------------');

                return s3.listAllObjects({
                    bucket: bucketTarget,
                    onData: function(files) {
                        filesTarget = filesTarget.concat(files);
                    }
                });
            })
            .then(function() {
                var totalSize = 0;
                return Promise.map(filesTarget, function(file, index) {
                        filesTargetDict[file.Key] = index;
                        totalSize += file.Size;
                    })
                    .then(function() {
                        return totalSize;
                    });
            })
            .then(function(totalSize) {

                util.log('------------------------------------------');
                util.log('Target Bucket:', bucketTarget);
                util.log('Target Objects:', filesTarget.length);
                util.log('Target Total Size:', prettyBytes(totalSize));
                util.log('------------------------------------------');

                var bar = util.progress(filesSource.length, {
                    title: 'Copy Objects to bucket: ' + bucketTarget
                });

                return Promise.map(filesSource, function(file) {
                    return Promise.resolve()
                        .delay(20)
                        .then(function() {
                            var fileTarget = filesTargetDict[file.Key];
                            if (fileTarget) {
                                fileTarget = filesTarget[fileTarget];
                                //console.log(file.ETag,fileTarget.ETag);
                                if (file.Size == fileTarget.Size) {
                                    filesSkipped.push(file.Key);
                                    return;
                                }
                            }

                            var keyEncoded = encodeURI(file.Key);

                            return s3.copyObjectAsync({
                                Bucket: bucketTarget,
                                CopySource: bucketSource + '/' + keyEncoded,
                                Key: file.Key,
                                /*
                                Metadata: {
                                  Checksum: file.Metadata.Checksum
                                }*/
                            }).
                            then(function() {
                                filesCopied.push(file.Key);
                            });
                        })
                        .then(function() {
                            bar.tick({
                                title: file.Key
                            });
                        });
                }, {
                    concurrency: 20
                });
            })
            .then(function() {
                util.success(
                    `Deployment to ${bucketTarget} successful` +
                    `\nFiles Copied: ${filesCopied.length}` +
                    `\nFiles Skipped: ${filesSkipped.length}`
                );
            });

    }

    return sync;
};

var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');

module.exports = function(app) {

    var config = app.get('git');

    app.git.log = function(options) {

        var filePath;
        if (options.file) {
            filePath = app.git.getPath(options.file);
        }

        return app.git.repository.getBranchCommit(app.git.branch)
            .then(function(commit) {

                return new Promise(function(resolve, reject) {

                    var history = [];
                    var eventEmitter = commit.history();

                    eventEmitter.on('commit', onCommit);
                    eventEmitter.on('end', function() {
                        resolve(history);
                    });

                    eventEmitter.on('error', reject);
                    eventEmitter.start();

                    function onCommit(commit) {

                        return Promise.resolve()
                            .then(function() {

                                if (filePath) {

                                    return commit.getDiff()
                                        .then(function(diffList) {

                                            return Promise.reduce(diffList, function(prevVal, diff) {

                                                return diff.patches()
                                                    .then(function(patches) {

                                                        var newVal = patches.reduce(function(prevValDiff, patch) {
                                                            var result =
                                                                prevValDiff ||
                                                                !!~patch.oldFile().path().indexOf(filePath) ||
                                                                !!~patch.newFile().path().indexOf(filePath);
                                                            return result;
                                                        }, false);

                                                        return prevVal || newVal;
                                                    });

                                            }, false);


                                        });
                                }

                                return true;

                            })
                            .then(function(addCommit) {

                                if (addCommit) {

                                    var author = commit.author();

                                    history.push({
                                        sha: commit.sha(),
                                        message: commit.message(),
                                        summary: commit.summary(),
                                        date: commit.date(),
                                        author: {
                                            name: author.name(),
                                            email: author.email()
                                        },
                                        body: commit.body(),
                                    });

                                    if (history.length == 20) {
                                        eventEmitter.emit('end');
                                    }

                                }

                            });
                    }

                });
            });

        promise.done();
        return promise;

    }

};

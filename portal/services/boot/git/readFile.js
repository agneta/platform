var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');

module.exports = function(app) {

    app.git.readFile = function(options) {

        var file = app.git.getPath(options.file);

        var promise = app.git.repository.getCommit(options.commit)
            .then(function(commit) {
                return commit.getEntry(file);
            })
            .then(function(entry) {
                return entry.getBlob();
            })
            .then(function(blob) {
                return blob.toString();
            });

        promise.done();
        return promise;
    };

};

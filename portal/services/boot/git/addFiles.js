var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');
var fs = require('fs-promise');

module.exports = function(app) {

    app.git.addFiles = function(files) {

        var repo = app.git.repository;

        return repo.refreshIndex()
            .then(function(index) {

                if (!files) {
                    files = [];
                }

                return Promise.map(files, function(file) {
                        file = app.git.getPath(file);
                        return index.addByPath(file);
                    })
                    .then(function() {
                        return index.write();
                    })
                    .then(function() {
                        return index.writeTree();
                    });
            });

    };

};

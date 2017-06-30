var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');

module.exports = function(app) {

    app.git.addAll = function() {


        return app.git.native.add('./*');

        var repo = app.git.repository;
        var index;

        return repo.refreshIndex()
            .then(function(_index) {
                index = _index;
                return index.addAll();
            })
            .then(function() {
                return index.write();
            })
            .then(function() {
                return index.writeTree();
            });

    };

};

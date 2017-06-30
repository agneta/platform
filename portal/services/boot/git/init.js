var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var fs = require('fs-promise');
var yaml = require('js-yaml');

module.exports = function(app) {

    var config = app.get('git');

    if (!config) {
        throw new Error('You must have your git configurations');
    }

    if (!config.remote) {
        throw new Error('You must have your git remote configurations');
    }

    if (!config.remote.url) {
        throw new Error('You must have your git remote url');
    }

    var webPrj = app.get('options').web.project;
    var repoPath = path.join(webPrj.paths.project, app.git.name);
    var repo;

    app.git.native = require('simple-git/promise')(webPrj.paths.project);

    var promise = Promise.resolve()
        .then(function() {
            if (!fs.existsSync(repoPath)) {
                return nodegit.Repository.init(repoPath, 0)
                    .then(function() {
                        return true;
                    });
            }
        })
        .then(function(initiated) {
            return nodegit.Repository.open(repoPath)
                .then(function(repository) {

                    repo = repository;
                    repo.initiated = initiated;
                    app.git.repository = repository;
                    return repo.getRemotes();

                });
        })
        .then(function(remotes) {

            var foundRemote = remotes.indexOf(config.remote.name) >= 0;

            if (foundRemote) {
                return repo.getRemote(config.remote.name);
            } else {
                return nodegit.Remote.create(repo, config.remote.name, config.remote.url);
            }

        })
        .then(function(remote) {
            app.git.remote = remote;
            if (repo.initiated) {
                return app.git.update();
            }
        })
        .then(function() {
            return repo.getCurrentBranch();
        })
        .then(function(reference) {
            app.git.branch = reference;
        })
        .then(function() {

            console.log('Git repository is ready');
            console.log('Current branch is', app.git.branch.name());
            return;

            // Testing
            var filePath = path.join(webPrj.paths.project, 'website/source/pages/home.yml');
            return app.git.log({
                    file: filePath
                })
                .then(function(log) {
                    console.log(log);

                    return app.git.readFile({
                        file: filePath,
                        commit: 'bd4e1dfe140299e698d771b2da189b54f5da7206'
                    });
                })
                .then(console.log);

        });

    promise.done();
    return promise;

};

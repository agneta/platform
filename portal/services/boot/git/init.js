const nodegit = require('nodegit');
const path = require('path');
const simplegit = require('simple-git/promise');

module.exports = function(app) {

    var base_dir = process.cwd();
    var repoPath = path.join(base_dir, app.git.name);
    var config = app.get('git');

    app.git.native = simplegit(base_dir);

    return Promise.resolve()
        .then(function() {
            return nodegit.Repository.open(repoPath);
        })
        .then(function(repository) {
            app.git.repository = repository;
            return app.git.repository.getRemote(config.remote.name);

        })
        .then(function(remote) {
            app.git.remote = remote;
            return app.git.repository.getCurrentBranch();

        })
        .then(function(reference) {
            app.git.branch = reference;
        });

};

var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');

module.exports = function(app) {

    var config = app.get('git');

    app.git.push = function(message, req) {

        var repo = app.git.repository;
        var Account = app.models.Account;
        var index;
        var commit;

        var git = app.git.native;

        return git.status()
            .then(function(status) {

                if (!status.files.length) {
                    return Promise.reject({
                        statusCode: 400,
                        message: 'No changes to commit'
                    });
                }

                return git.add('./*');
            })
            .then(function() {

                return Account.findById(req.accessToken.userId);
            })
            .then(function(account) {
                //console.log(account, name);
                var name = account.name || account.username || account.email.split('@')[0];
                var email = account.email;

                git.addConfig('user.name', name);
                git.addConfig('user.email', email);

                return git.commit(message);

            })
            .then(function(result) {

                commit = result.commit;
                var branchName = app.git.branch.name();
                //console.log(config.remote.name, branchName);

                return app.git.remote.push(
                    [branchName + ":" + branchName], {
                        callbacks: {
                            credentials: app.git.credentials
                        }
                    });

            })
            .then(function(result) {
                //console.log(result);
                return {
                    commit: commit
                };
            });

    };
};

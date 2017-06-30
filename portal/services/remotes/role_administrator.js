var _ = require("lodash");

module.exports = function(Model, app) {

    var Account = app.models.Account;
    app.helpers.mixin("disableAllMethods", Model);

    Model.validatesUniquenessOf('accountId', {
        message: 'Account is already an administrator'
    });

    ////////////////////////////////////////////////////////

    Model.me = function(req) {

        return Model.findOne({
            where: {
                accountId: req.accessToken.userId
            }
        });

    };

    Model.remoteMethod(
        'me', {
            description: "Get user's administrative settings",
            accepts: [{
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/me'
            },
        }
    );

    ////////////////////////////////////////

    Model.new = function(options) {

        if (!options.email) {
            throw new Error("Must provide an email for administrator creation");
        }

        return Account.findOne({
                where: {
                    email: options.email
                }
            })
            .then(function(account) {

                if (!account) {
                    return Account.create({
                        email: options.email,
                        password: options.password || 'password',
                        emailVerified: true,
                        language: 'en'
                    });
                }

                return account;

            })
            .then(function(account) {

                return Model.findOrCreate({
                    where: {
                        accountId: account.id
                    }
                }, {
                    accountId: account.id
                });
            });

    };
};

var _ = require('lodash');

module.exports = function(Model, app) {


    Model.changePasswordAdmin = function(password, accountId, req) {

        var account;
        var AccessToken = app.models.AccessToken;

        return Model.findById(accountId)
            .then(function(_account) {

                account = _account;

                if (!account) {
                    var err = new Error('Account not found');
                    err.statusCode = 400;
                    throw err;
                }

                return AccessToken.destroyAll({
                    userId: account.id
                });
            })
            .then(function() {

                return account.updateAttributes({
                    password: password
                });

            })
            .then(function() {

                Model.sendVerification({
                    account: account,
                    req: req,
                    template: 'password-change',
                    subject: 'Your password has changed.'
                });

                Model.activity({
                    req: req,
                    action: 'password_change_admin',
                    data: {
                        accountId: account.id
                    }
                });

                return {
                    success: 'Password has changed.'
                };

            });

    };

    Model.remoteMethod(
        'changePasswordAdmin', {
            description: 'Change password for a user with email.',
            accepts: [{
                arg: 'password',
                type: 'string',
                required: true
            }, {
                arg: 'accountId',
                type: 'string',
                required: true
            }, {
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
                path: '/change-password-admin'
            },
        }
    );


};

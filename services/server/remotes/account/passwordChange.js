module.exports = function(Model, app) {

    Model.passwordChange = function(password_old, password_new, req) {

        return Model.signOutAll(req)
            .then(function() {
                return Model.findById(req.accessToken.userId);
            })
            .then(function(account) {
                return account.updateAttributes({
                    password: password_new
                });
            })
            .then(function(account) {

                Model.activity({
                    req: req,
                    action: 'password_change'
                });

                return {
                    success: 'Your password has changed. Next time you login, enter your new password',
                    email: account.email
                };

            });

    };


    Model.remoteMethod(
        'passwordChange', {
            description: 'Change password for a user with email.',
            accepts: [{
                arg: 'password_old',
                type: 'string',
                required: false
            }, {
                arg: 'password_new',
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
                path: '/password-change'
            },
        }
    );

    Model.beforeRemote('passwordChange', app.helpers.resubmitPassword);


};

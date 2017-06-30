var _ = require('lodash');

module.exports = function(Model, app) {

    var rolesConfig = app.get('roles');

    Model.get = function(req, id) {

        if (req.accessToken.roles.administrator) {

            return Model.findById(id, {
                    include: Model.rolesInclude
                })
                .then(function(account) {
                    if (!account) {
                        throw new Error('Account not found');
                    }

                    account = account.__data;

                    var roles = _.pick(account, Model.roleKeys);
                    account = _.omit(account, Model.roleKeys.concat(['password']));

                    for (var roleKey in roles) {
                        var role = roles[roleKey];
                        var config = rolesConfig[roleKey];
                        if (config.form) {
                            role.editable = true;
                        }
                    }

                    account.roles = roles;

                    return account;
                });

        } else {

            return Model.findById(id, {
                fields: {
                    id: true,
                    name: true,
                    avatar: true,
                    username: true
                }
            });

        }



    };

    Model.remoteMethod(
        'get', {
            description: "Get user's administrative settings",
            accepts: [{
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }, {
                arg: 'id',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/get'
            }
        }
    );

};

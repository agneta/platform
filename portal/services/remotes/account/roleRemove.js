var _ = require('lodash');

module.exports = function(Model, app) {

    Model.roleRemove = function(id, name) {

        return Model.findById(id)
            .then(function(account) {

                var RoleModel = getRoleModel(account, name);

                return RoleModel.findOne({
                    where: {
                        accountId: account.id
                    }
                });

            })
            .then(function(result) {

                if (!result) {
                    throw new Error('Role was not found');
                }

                return result.destroy();

            })
            .then(function() {
                return {
                    message: 'The role was removed'
                };
            });

    };

    Model.remoteMethod(
        'roleRemove', {
            description: "",
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
                arg: 'name',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/role-remove'
            }
        }
    );

    function getRoleModel(account, name) {

        if (!account) {
            throw new Error("Account not found");
        }

        var role = Model.roleOptions[name];

        if (!role) {
            throw new Error('No role found: ' + name);
        }

        return app.models[role.model];

    }

};

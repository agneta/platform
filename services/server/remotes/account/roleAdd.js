var _ = require('lodash');

module.exports = function(Model, app) {

    Model.roleOptions = app.get('roles');
    Model.roleKeys = _.keys(Model.roleOptions);

    Model.rolesInclude = _.map(Model.roleKeys, function(name) {
        return {
            relation: name,
            scope: {
                fields: ['id']
            }
        };
    });

    Model._roleAdd = function(id, name, _fields) {

        return Model.findById(id)
            .then(function(account) {

                if (!account) {
                    throw new Error("Account not found");
                }

                var role = Model.roleOptions[name];

                if (!role) {
                    throw new Error('No role found: ' + name);
                }

                var RoleModel = app.models[role.model];

                var fields = {
                    accountId: account.id
                };

                if (_fields) {
                    _.extend(fields, _fields);
                }

                return RoleModel.findOrCreate({
                    where: {
                        accountId: account.id
                    }
                }, fields);

            })
            .then(function(result) {
                if (result[1]) {
                    return result[1];
                }

                throw new Error('Role already exists');
            });

    };
};

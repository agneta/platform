module.exports = function(app) {


    function setRoles(Account, roles) {

        var Role = app.models.Role;

        for (var name in roles) {
            var role = roles[name];
            var model = app.models[role.model];

            model.belongsTo(Account, {
                foreignKey: 'accountId',
                as: 'account'
            });

            model.validatesUniquenessOf('accountId');

            Account.hasOne(model, {
                foreignKey: 'accountId',
                as: name
            });

            Role.registerResolver(name, checkRole);

        }

        function checkRole(role, context, cb) {
            cb(null, context.accessToken && context.accessToken.roles && context.accessToken.roles[role]);
        }

    }

    setRoles(app.models.Account, app.get('roles'));

    app.helpers.setRoles = setRoles;

};

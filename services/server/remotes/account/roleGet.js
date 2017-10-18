const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.roleGet = function(roleName, req) {

    return Model.__roleGet(req.accessToken.userId, roleName);

  };

  Model.__roleGet = function(id, roleName) {

    var role = Model.roleOptions[roleName];
    var roleService = role.service || {};

    return Promise.resolve()
      .then(function() {

        if (!role) {
          throw new Error('No role found: ' + roleName);
        }

        var RoleModel = app.models[role.model];

        return RoleModel.findOne({
          where: {
            accountId: id
          },
          include: roleService.include
        });

      });


  };

  Model.remoteMethod(
    'roleGet', {
      description: '',
      accepts: [{
        arg: 'roleName',
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
        path: '/role-get'
      }
    }
  );

};

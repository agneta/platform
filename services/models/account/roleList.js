const Promise = require('bluebird');
module.exports = function(Model, app) {

  var rolesConfig = app.get('roles');
  Model.roleList = function(req) {

    return Promise.resolve()
      .then(function() {
        return Model.__me({
          id: req.accessToken.userId,
          fields: {
            id: true
          }
        });
      })
      .then(function(account) {

        var result = [];

        for (var roleKey in account.role) {
          var role = account.role[roleKey];
          var config = rolesConfig[roleKey];
          result.push({
            id: role.id,
            title: app.lng(config.title,req)
          });
        }

        return {
          list: result
        };

      });

  };

  Model.remoteMethod(
    'roleList', {
      description: '',
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
        path: '/role-list'
      }
    }
  );

};

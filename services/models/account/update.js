var _ = require('lodash');

module.exports = function(Model) {

  Model.update = function(data, req) {
    return Model.__update({
      id: req.accessToken.userId,
      data: data
    });
  };

  Model.__update = function(id, data) {
    return Model.__get(id)
      .then(function(account) {
        data = _.pick(data, ['name', 'username', 'email']);
        return account.updateAttributes(data);
      });
  };

  Model.remoteMethod(
    'update', {
      description: '',
      accepts: [ {
        arg: 'data',
        type: 'object',
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
        path: '/update'
      }
    }
  );
};

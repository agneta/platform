module.exports = function(Model) {

  Model.me = function(req) {

    return Model.findOne({
      where: {
        accountId: req.accessToken.userId
      }
    });

  };

  Model.remoteMethod(
    'me', {
      description: 'Get user\'s administrative settings',
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
};

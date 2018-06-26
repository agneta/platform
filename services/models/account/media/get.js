module.exports = function(Model, app) {
  Model.__mediaGet = function(options) {
    var MediaModel = app.storage.getModel(options.type, Model);

    return MediaModel.__details({
      location: Model.__mediaLocation({
        path: options.location,
        accountId: options.accountId
      })
    });
  };

  Model.mediaGet = function(location, type, req) {
    return Model.__mediaGet({
      location: location,
      type: type,
      accountId: req.accessToken.userId
    });
  };

  Model.remoteMethod('mediaGet', {
    description: 'Get a media file from an account',
    accepts: [
      {
        arg: 'location',
        type: 'string',
        required: true
      },
      {
        arg: 'type',
        type: 'string',
        required: true
      },
      {
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      }
    ],
    returns: {
      arg: 'result',
      type: 'object',
      root: true
    },
    http: {
      verb: 'post',
      path: '/media-get'
    }
  });
};

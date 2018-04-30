
module.exports = function(Model) {

  Model.__mediaGet = function(options) {
    return Model.projectModel('Media_Private')
      .__details({
        location: Model.__mediaLocation({
          path: options.location,
          accountId: options.accountId
        })
      });
  };

  Model.mediaGet = function(location,req) {

    return Model.__mediaGet({
      location: location,
      accountId: req.accessToken.userId
    });
  };

  Model.remoteMethod(
    'mediaGet', {
      description: 'Get a media file from an account',
      accepts: [{
        arg: 'location',
        type: 'string',
        required: true
      },{
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
        path: '/media-get'
      }
    });

};

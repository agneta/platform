
module.exports = function(Model) {

  Model.__mediaUpdate = function(options) {
    return Model.getModel('Media_Private')
      .__updateFile({
        location: Model.__mediaLocation({
          location: options.location,
          accountId: options.accountId
        }),
        privacy: options.privacy
      });
  };

  Model.mediaUpdate = function(location,privacy,req) {

    return Model.__mediaUpdate({
      location: location,
      accountId: req.accessToken.userId,
      privacy: privacy,
    });
  };

  Model.remoteMethod(
    'mediaUpdate', {
      description: 'Set privacy for account media file',
      accepts: [{
        arg: 'location',
        type: 'string',
        required: true
      },{
        arg: 'privacy',
        type: 'object',
        required: false
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
        path: '/media-privacy'
      }
    });

};

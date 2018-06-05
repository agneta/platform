const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.__mediaUpload = function(options) {

    var Media_Private = app.models.Media_Private;
    var req = options.req;
    var accountId = options.accountId;
    var location = options.location;
    var uploadOptions;
    //console.log('about to prepare file', data);

    return Promise.resolve()
      .then(function() {

        uploadOptions = {
          req: req,
          field: 'object',
          onFile: function(data){

            accountId = data.formData.accountId || accountId;
            location = data.formData.location || location;

            uploadOptions.location = getLocation();

            if(!uploadOptions.location){
              return Promise.reject({
                statusCode: 400,
                message: 'Invalid location to upload image'
              });
            }
          }
        };

        return Media_Private.__uploadFile(uploadOptions);

        function getLocation() {

          if(!accountId || !location){
            return;
          }

          return Model.__mediaLocation({
            accountId: accountId,
            path: location
          });

        }

      });

  };

  Model.mediaUpload = function(req) {

    return Model.__mediaUpload({
      req: req,
      accountId: req.accessToken.userId+''
    });

  };

  Model.remoteMethod(
    'mediaUpload', {
      description: 'Upload an account media file',
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
        path: '/media-upload'
      }
    });


};

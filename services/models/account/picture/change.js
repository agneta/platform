const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.__pictureChange = function(options) {

    var Media_Private = app.models.Media_Private;
    var req = options.req;
    var accountId = options.accountId;
    var uploadOptions;
    //console.log('about to prepare file', data);

    return Promise.resolve()
      .then(function() {

        uploadOptions = {
          req: req,
          field: 'object',
          onFile: function(){
            if(!uploadOptions.location){
              return Promise.reject({
                statusCode: 400,
                message: 'Invalid location to upload image'
              });
            }
          }
        };

        if(accountId){
          uploadOptions.location = getLocation(accountId);
        }else{
          uploadOptions.onField = function(fieldname, val){
            if(fieldname!='accountId'){
              return;
            }
            accountId = val;
            uploadOptions.location = getLocation(val);
          };
        }

        return Media_Private.__uploadFile(uploadOptions);

        function getLocation(id) {
          return Model.__mediaLocation({
            accountId: id,
            path: 'profile'
          });
        }

      })
      .then(function() {
        return Model.__get(accountId);
      })
      .then(function(account) {
        return account.updateAttribute('picturePrivate',uploadOptions.location);
      })
      .then(function() {

        return {
          message: 'Your picture is updated'
        };
      });

  };

  Model.pictureChange = function(req) {

    return Model.__pictureChange({
      req: req,
      accountId: req.accessToken.userId+''
    });

  };

  Model.remoteMethod(
    'pictureChange', {
      description: 'Change the account profile picture',
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
        path: '/picture-change'
      }
    });


};

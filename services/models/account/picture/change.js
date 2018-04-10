const Promise = require('bluebird');
const multer = require('multer');

module.exports = function(Model, app) {

  var uploadSingle = multer({
    dest: Model.__tempUploads
  })
    .single('object');

  Model.pictureChange = function(password, req) {

    var Media_Private = app.models.Media_Private;
    //console.log('about to prepare file', data);

    var location = Model.__mediaLocation({
      req: req,
      location: 'profile'
    });
    return Promise.resolve()
      .then(function() {
        return Media_Private.__prepareFile(req.file, {
          location: location
        });
      })
      .then(function(object) {
        console.log(object);
        return {
          message: 'Your picture is updated'
        };
      });

  };

  Model.remoteMethod(
    'pictureChange', {
      description: 'Change the account profile picture',
      accepts: [{
        arg: 'password',
        type: 'string',
        required: true,
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
        path: '/picture-change'
      }
    }
  );

  Model.beforeRemote('pictureChange', function(context, instance, next) {
    uploadSingle(context.req, context.res, next);
  });


};

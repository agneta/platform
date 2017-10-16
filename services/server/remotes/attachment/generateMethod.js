const Promise = require('bluebird');
const multer = require('multer');

var uploadSingle = multer({
  dest: 'temp/uploads/attachments'
})
  .single('object');


module.exports = function(Model) {

  Model.__generateMethod = function(options) {

    options = options || {};

    if(!options.model){
      throw new Error('Must provide a model');
    }

    var model = options.model;
    var name = options.name || 'uploadFile';
    var pathRemote = options.path || '/upload-file';

    model[name] = function(req) {

      return Promise.resolve()
        .then(function() {
          var params = req.body;

          if (!params.name) {
            throw new Error('We need a name to assign to the file');
          }

          //console.log('about to prepare file', data);
          return model.__saveFile({
            file: req.file,
            name: params.name
          });
        })
        .then(function() {

          return {
            success: 'File is uploaded'
          };

        });

    };

    model.beforeRemote(name, function(context, instance, next) {
      uploadSingle(context.req, context.res, next);
    });

    model.remoteMethod(
      name, {
        description: 'Upload a single file',
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
          path: pathRemote
        }
      }
    );

  };
};

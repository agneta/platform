const Promise = require('bluebird');
const multer = require('multer');

module.exports = function(Model) {

  var uploadArray = multer({
          dest: Model.__tempUploads
      })
      .array('objects');

    Model.uploadFiles = function(req) {

        var data = Model.__uploadData(req);
        var count = 0;

        Promise.map(req.files, function(file) {
                return Model.__prepareFile(file, {
                        dir: data.dir
                    })
                    .then(function() {
                        count++;
                        Model.io.emit('files:upload:progress', {
                            count: count,
                            total: req.files.length
                        });

                        return file.id;
                    });
            }, {
                concurrency: 5
            })
            .then(function(files) {
                Model.io.emit('files:upload:complete', files);
            });


        return Promise.resolve({
            _success: "Files are uploading to your storage service"
        });

    };

    Model.beforeRemote('uploadFiles', function(context, instance, next) {
        uploadArray(context.req, context.res, next);
    });

    Model.remoteMethod(
        'uploadFiles', {
            description: "Upload an array of files",
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
                path: '/upload-files'
            }
        }
    );

};

const Promise = require('bluebird');
const multer = require('multer');

module.exports = function(Model) {

    var uploadSingle = multer({
            dest: Model.__tempUploads
        })
        .single('object');


    Model.uploadFile = function(req) {

        var data = Model.__uploadData(req);
        //console.log('about to prepare file', data);
        Model.__prepareFile(req.file, {
                dir: data.dir,
                name: data.name,
                location: data.location
            })
            .then(function(object) {
                Model.io.emit('file:upload:complete', {
                    file: object
                });
            });

        return Promise.resolve({
            _success: 'File is uploading'
        });

    };

    Model.beforeRemote('uploadFile', function(context, instance, next) {
        uploadSingle(context.req, context.res, next);
    });

    Model.remoteMethod(
        'uploadFile', {
            description: "Upload a single file",
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
                path: '/upload-file'
            }
        }
    );

};

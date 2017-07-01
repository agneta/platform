const Promise = require('bluebird');

module.exports = function(Model, app) {

    Model.deleteObject = function(location) {

        var file;
        var files;

        return Model.findOne({
                where: {
                    location: location
                }
            })
            .then(function(_file) {

                file = _file;

                if (!file) {
                    return Promise.reject({
                        message: "No file found at: " + location
                    });
                }

                files = [{
                    Key: location
                }];

                if (file.type == 'folder') {
                    return Model._list(file.location)
                        .then(function(result) {
                            return Promise.map(result.objects, function(object) {
                                //console.log('delete folder object:', object.name);
                                return Model.deleteObject(object.location);
                            }, {
                                concurrency: 6
                            });
                        });
                }

                Model.__images.onDelete({
                    file: file,
                    files: files,
                    location: location
                });

            })
            .then(function() {

                return app.storage.s3.deleteObjectsAsync({
                    Bucket: Model.__bucket.name,
                    Delete: {
                        Objects: files
                    }
                });

            })
            .then(function() {

                return file.destroy();
            })
            .then(function() {
                return {
                    _success: 'The file is deleted'
                };
            });
    };

    Model.remoteMethod(
        'deleteObject', {
            description: "Delete an object",
            accepts: [{
                arg: 'location',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/delete-object'
            }
        });

};

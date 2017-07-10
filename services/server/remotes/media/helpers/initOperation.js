const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model, app) {

    Model.__initOperation = function(options) {

        var socketProps = {
            name: options.name,
            index: options.index,
            id: options.id
        };

        return new Promise(function(resolve, reject) {

                var writableStream = app.storage.upload({
                    container: Model.__bucket.name,
                    remote: options.location,
                    contentType: options.mimetype
                });

                writableStream.on('error', reject);
                writableStream.on('success', resolve);

                var uploadedSize = 0;

                writableStream.on('data', function(buffer) {

                    uploadedSize += buffer.length;

                    options.onProgress(_.extend({
                        uploadedSize: uploadedSize,
                        fileSize: options.size,
                        percentage: uploadedSize / options.size
                    }, socketProps));

                });

                options.file.pipe(writableStream);

            }).then(function() {

                var fileProps = {
                    name: options.name,
                    location: options.location,
                    isSize: options.isSize,
                    size: options.size,
                    type: options.type,
                    contentType: options.mimetype
                };
                return Model.findOne({
                        where: {
                            location: options.location
                        }
                    })
                    .then(function(fileInstance) {
                        if (fileInstance) {
                            //console.log('file update', fileProps);
                            return fileInstance.updateAttributes(fileProps);
                        } else {
                            //console.log('file create', fileProps);
                            return Model.create(fileProps);
                        }
                    });

            })
            .then(function(dbObject) {
                options.objectId = dbObject.id;
                return dbObject;
            });

    };
};

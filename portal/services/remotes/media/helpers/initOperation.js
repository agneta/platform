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
                remote: options.name,
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

            Model.io.emit('file:upload:operation:start', socketProps);

        }).then(function() {
            Model.io.emit('file:upload:operation:complete', socketProps);
        });

    };
};

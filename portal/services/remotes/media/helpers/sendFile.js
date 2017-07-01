const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model) {

    Model.__sendFile = function(file) {

        file.stream.setMaxListeners(20);

        var fileProps = {
            name: file.name,
            location: file.location,
            type: file.type,
            contentType: file.mimetype,
            size: file.size,
        };

        return Model.findOne({
                where: {
                    location: file.location
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
            })
            .then(function(fileInstance) {

                //console.log('file instance', fileProps);

                Model.io.emit('file:upload:created', {
                    id: fileInstance.id
                });

                var options = {
                    file: file.stream,
                    id: fileInstance.id,
                    name: file.location,
                    mimetype: file.mimetype
                };

                var operations = [];

                operations.push(
                    _.extend({
                        size: file.size
                    }, options));

                switch (file.type) {
                    case 'pdf':
                        //TODO: Make PDF preview images
                        break;
                    case 'image':
                        Model.__images.onUpload(options, operations);
                        break;
                }

                var operationProgress = [];
                _.map(operations, function() {
                    operationProgress.push(0);
                });

                function onProgress(progress) {
                    operationProgress[progress.index] = progress.percentage;

                    var percentage = _.reduce(operationProgress, function(sum, n) {
                        return sum + n;
                    }, 0);
                    percentage /= operationProgress.length;
                    Model.io.emit('file:upload:progress', {
                        percentage: (percentage * 100).toFixed(2) / 1
                    });
                }

                function prepareOperation(options) {
                    options.onProgress = onProgress;
                    return Model.__initOperation(options);
                }

                operations = _.map(operations, function(operation, index) {

                    if (operation.then) {
                        return operation.then(function(options) {
                            options.index = index;
                            return prepareOperation(options);
                        });
                    }
                    operation.index = index;
                    return prepareOperation(operation);

                });

                //console.log('operations', operations.length);

                return Promise.all(operations)
                    .then(function() {
                        Model.io.emit('file:upload:progress', {
                            percentage: 100
                        });
                        return fileInstance;
                    })
                    .catch(function(err) {
                        console.error('File Upload error');
                        console.error(err);
                    });

            });

    };
};

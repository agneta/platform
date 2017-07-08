const Promise = require('bluebird');
const _ = require('lodash');
var uuidV1 = require('uuid/v1');


module.exports = function(Model) {

    Model.__sendFile = function(file) {

        var uuid = uuidV1();

        file.stream.setMaxListeners(20);

        Model.io.emit('file:upload:created', {
            id: uuid
        });

        var operations = [];
        var options = {
            id: uuid,
            file: file.stream,
            name: file.name,
            location: file.location,
            type: file.type,
            mimetype: file.mimetype,
            size: file.size,
        };

        operations.push(options);

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
                return Model.__checkFolders({
                  dir: file.dir
                });
            })
            .then(function() {
                Model.io.emit('file:upload:progress', {
                    percentage: 100
                });
            })
            .catch(function(err) {
                console.error('File Upload error');
                console.error(err);
            });

    };
};

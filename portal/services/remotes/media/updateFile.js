const Promise = require('bluebird');
const path = require('path');
const urljoin = require('url-join');

module.exports = function(Model) {

    Model.updateFile = function(id, dir, name) {

        var operations;
        var file;
        var target;

        return Model.findById(id)
            .then(function(_file) {

                file = _file;

                if (!file) {
                    return Promise.reject({
                        message: "File not found"
                    });
                }

                if (dir || name) {

                    target = name;

                    if (dir) {
                        target = urljoin(dir, name);
                    }

                    if (target == file.location) {
                        return;
                    }

                    operations = [{
                        source: file.location,
                        target: target
                    }];

                    if (file.type == 'folder') {
                        return Model._list(file.location)
                            .then(function(result) {
                                return Promise.map(result.objects, function(object) {

                                    var childDir = object.location.replace(file.location, target);
                                    childDir = path.normalize(childDir);
                                    childDir = childDir.split('/');
                                    childDir.pop();
                                    childDir = childDir.join('/');

                                    return Model.updateFile(object.id, childDir, object.name);
                                }, {
                                    concurrency: 6
                                });
                            });
                    }

                    Model.__images.onUpdate({
                        file: file,
                        target: target,
                        operations: operations
                    });
                }
            })
            .then(function() {

                if (!operations) {
                    return file;
                }

                return Promise.map(operations, function(operation) {
                        return Model.__moveObject(operation);
                    })
                    .then(function() {
                        return file.updateAttributes({
                            location: target,
                            name: name
                        });
                    });
            })
            .then(function(object) {
                Model.__prepareObject(object);
                return {
                    _success: 'Object was updated',
                    file: object
                };
            });

    };



    Model.remoteMethod(
        'updateFile', {
            description: "Update a file",
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
                arg: 'dir',
                type: 'string',
                required: false
            }, {
                arg: 'name',
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
                path: '/update-file'
            }
        }
    );

};

const Promise = require('bluebird');
const path = require('path');
const urljoin = require('url-join');
const _ = require('lodash');

module.exports = function(Model, app) {

    var rolesConfig = app.get('roles');

    Model.updateFile = function(id, dir, name, contentType, roles) {

        var operations;
        var file;
        var target;

        roles = roles || [];

        return Promise.map(roles, function(roleName) {
                var role = rolesConfig[roleName];
                if (!role) {
                    return Promise.reject({
                        statusCode: 400,
                        message: `Role does not exist ${roleName}`
                    });
                }
            })
            .then(function() {
                return Model.findById(id);
            })
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

                                    return Model.updateFile(object.id, childDir, object.name, null, roles);
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
                        operation.contentType = contentType;
                        return Model.__moveObject(operation);
                    })
                    .then(function() {

                        var attrs = {};

                        if (contentType) {
                            attrs.contentType = contentType;
                            attrs.type = app.helpers.mediaType(contentType);
                        }

                        attrs.location = target;
                        attrs.name = name;
                        attrs.roles = _.uniq(roles);

                        return Model.findOne({
                                where: {
                                    location: target
                                }
                            })
                            .then(function(file) {
                                if (file) {
                                    console.log(attrs);
                                    return file.updateAttributes(attrs);
                                }
                                console.warn('Could not find object to update:', target);
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
            }, {
                arg: 'contentType',
                type: 'string',
                required: false
            }, {
                arg: 'roles',
                type: 'array',
                required: false
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

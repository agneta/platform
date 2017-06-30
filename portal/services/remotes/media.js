const fs = require('fs');
const stream = require('stream');
const S = require('string');
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');
const urljoin = require('url-join');
const prettyBytes = require('pretty-bytes');
const multer = require('multer');
const mime = require('mime-types');


var tempUploads = 'temp/uploads/';
var uploadArray = multer({
        dest: tempUploads
    })
    .array('objects');
var uploadSingle = multer({
        dest: tempUploads
    })
    .single('object');

var unlink = Promise.promisify(fs.unlink);

module.exports = function(Model, app) {

    var config = app.get('storage');
    if (!config) {
        return;
    }
    var bucket = config.buckets.media;
    var images = require('./media/images')(Model, app);

    Model.io = app.io.create({
        name: 'media',
        auth: {
            allow: ['editor']
        }
    });

    Model.observe('before save', function(ctx) {

        var instance = ctx.currentInstance || ctx.instance;
        var data = ctx.data || instance;

        return Promise.resolve()
            .then(function() {
                if (instance.type == 'folder') {
                    return;
                }

                if (!instance.size && !data.size) {
                    return app.storage.s3.headObjectAsync({
                            Bucket: bucket.name,
                            Key: instance.location
                        })
                        .then(function(storageObjectHead) {
                            data.size = storageObjectHead.ContentLength;
                            //console.log('size', instance.location);
                        })
                        .catch(function(err) {
                            console.log('error', instance);
                            throw err;
                        });
                }

            })
            .then(function() {
                return images.onSaveBefore(ctx);
            });

    });

    app.helpers.mixin("disableAllMethods", Model);

    Model.search = function(text, keywords, req) {

        var result;

        return Model.engine.find({
                keywords: keywords,
                where: {
                    isSize: false
                },
                fields: {
                    location_keywords: false,
                }
            })
            .then(function(_result) {
                result = _result;
                return Promise.map(result.items, function(item) {
                    return prepareObject(item);
                });
            })
            .then(function(items) {
                result.items = items;
                return result;
            });

    };


    Model._list = function(dir, limit, marker) {

        marker = marker || 0;
        dir = dir || '';
        var prefix = dir.length ? dir + '/' : '';

        //---------------------------------------------------

        dir = dir.split('/').join('\\/');
        if (dir && dir.length) {
            dir += '\\/';
        }

        var regexp = '/^' + dir + '[^\\/]+$/';

        var whereFilter = {
            location: {
                regexp: regexp
            }
        };
        var objects = [];
        return Model.find({
                where: whereFilter,
                limit: limit,
                skip: marker,
                order: ['type ASC','name ASC']
            })
            .then(function(_objects) {

                for (var object of _objects) {
                    prepareObject(object);
                }

                objects = _objects;

                return Model.count(
                    whereFilter
                );
            })
            .then(function(count) {
                var truncated = (count - marker) > limit;
                var nextMarker;
                var nextLimit;
                if (truncated) {
                    nextMarker = marker + limit;
                    nextLimit = Math.min(count - nextMarker, limit);
                }
                return {
                    objects: objects,
                    nextMarker: nextMarker,
                    nextLimit: nextLimit,
                    truncated: truncated,
                    count: count
                };
            });

    };

    Model.list = function(dir, marker) {

        return Model._list(dir, 20, marker);
    };

    Model.remoteMethod(
        'list', {
            description: "List the files",
            accepts: [{
                arg: 'dir',
                type: 'string',
                required: false
            }, {
                arg: 'marker',
                type: 'number',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/list'
            }
        }
    );

    //------------------------------------------------------------------

    Model.add = function(data) {

        var attributes = {
            location: data.location.value,
            location_keywords: Model._getKeywords(data.location.positions),
        };

        var fields = [].concat(data.location);

        return Model._add({
            where: {
                location: data.location.value
            },
            include: {
                location: true,
                name: true,
                isSize: true,
                createdAt: true,
                type: true
            },
            findOnly: true,
            fields: fields,
            attributes: attributes
        });

    };

    //------------------------------------------------------------------

    Model.details = function(id, location) {

        var promise;

        if (id) {
            promise = Model.findById(id);
        }

        if (location) {
            promise = Model.findOne({
                where: {
                    location: fixPath(location)
                }
            });
        }

        if (!promise) {
            throw new Error('Must provide the file id or location');
        }

        return promise.then(function(object) {
            if (!object) {
                return {
                    notfound: 'Not found on database'
                };
            }

            return prepareObject(object);
        });

    };

    function prepareObject(object) {

        if (!object) {
            return;
        }

        var dir = object.location.split('/');
        dir.pop();
        dir = dir.join('/');

        object.dir = dir;

        switch (object.type) {
            case 'folder':
                return object;
        }

        object.url = urljoin('//', bucket.host, object.location);
        object.size = object.size ? prettyBytes(parseFloat(object.size)) : null;
        object.type = app.helpers.mediaType(object.contentType);
        object.ext = mime.extension(object.contentType);

        return object;
    }

    Model.remoteMethod(
        'details', {
            description: "Get a file details",
            accepts: [{
                arg: 'id',
                type: 'string',
                required: false
            }, {
                arg: 'location',
                type: 'string',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/details'
            }
        }
    );

    ///////////////////////////////////////////////

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

                    images.onUpdate({
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
                        return moveObject(operation);
                    })
                    .then(function() {
                        return file.updateAttributes({
                            location: target,
                            name: name
                        });
                    });
            })
            .then(function(object) {
                prepareObject(object);
                return {
                    _success: 'Object was updated',
                    file: object
                };
            });

    };

    function moveObject(operation) {
        return app.storage.s3.copyObjectAsync({
                Bucket: bucket.name,
                CopySource: urljoin(bucket.name, operation.source),
                Key: operation.target
            })
            .then(function() {
                return app.storage.s3.deleteObjectAsync({
                    Bucket: bucket.name,
                    Key: operation.source
                });
            });
    }

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

                images.onDelete({
                    file: file,
                    files: files,
                    location: location
                });

            })
            .then(function() {

                return app.storage.s3.deleteObjectsAsync({
                    Bucket: bucket.name,
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

    Model.uploadFile = function(req) {

        var data = uploadData(req);
        //console.log('about to prepare file', data);
        prepareFile(req.file, {
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

    //-----------------------------------

    Model.uploadFiles = function(req) {

        var data = uploadData(req);
        var count = 0;

        Promise.map(req.files, function(file) {
                return prepareFile(file, {
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

    function prepareFile(file, options) {

        var params = fixParams(file, options);

        var name = params.name;
        var dir = params.dir;
        var location = params.location;

        if (location) {
            var parsedLocation = path.parse(location);
            dir = parsedLocation.dir;
            name = parsedLocation.name;
        } else {

            if (!name) {
                name = path.parse(file.originalname).name;
            }

            name = S(name).slugify().s;
            location = getMediaPath(dir, name);
        }

        //console.log('prepare file', location, dir);

        var type = app.helpers.mediaType(file.mimetype);
        var stream = fs.createReadStream(file.path);

        return uploadFile({
                location: location,
                type: type,
                size: file.size,
                mimetype: file.mimetype,
                name: name,
                stream: stream
            })
            .then(function(fileInstance) {
                return unlink(file.path)
                    .then(function() {
                        return fileInstance;
                    });
            })
            .catch(function(error) {
                console.error(error);
                Model.io.emit('file:upload:error', error);
            });
    }

    function uploadFile(file) {

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
                        images.onUpload(options, operations);
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
                    return initOperation(options);
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

    }

    function initOperation(options) {

        var socketProps = {
            name: options.name,
            index: options.index,
            id: options.id
        };

        return new Promise(function(resolve, reject) {

            var writableStream = app.storage.upload({
                container: bucket.name,
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

    }

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

    ///////////////////////

    function uploadData(req) {

        var params = req.body;

        params.dir = fixPath(params.dir || '');

        if (params.location) {
            params.location = fixPath(params.location || '');
        }

        return params;

    }

    function getMediaPath(dir, name) {

        dir = dir || '';
        var result = path.join(dir, name);

        return result;
    }

    Model.newFolder = function(name, dir, req, cb) {

        return Model.create({
            name: name,
            location: getMediaPath(dir, name),
            type: 'folder'
        });

    };

    Model.remoteMethod(
        'newFolder', {
            description: "Upload a file",
            accepts: [{
                arg: 'name',
                type: 'string',
                required: true
            }, {
                arg: 'dir',
                type: 'string',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/new-folder'
            }
        }
    );

    function fixParams(file, params) {

        var name = params.name;
        var dir = params.dir;
        var location = params.location;

        if (location) {
            var parsedLocation = path.parse(location);
            dir = parsedLocation.dir;
            name = parsedLocation.name;
        } else {

            if (!name) {
                name = path.parse(file.originalname).name;
            }

            name = S(name).slugify().s;
            location = getMediaPath(dir, name);
        }

        return {
            name: name,
            dir: dir,
            location: location
        };

    }

    function fixPath(mediaPath) {
        mediaPath = path.normalize(mediaPath);

        if (mediaPath[0] == '/') {
            return mediaPath.substring(1);
        }
        return mediaPath;
    }

};

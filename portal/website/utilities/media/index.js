/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/media/index.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');

module.exports = function(util) {

    var services = util.locals.services;

    var configStorage = services.get('storage');

    var bucket;
    var Media;

    var foundObjects;
    var foundFolders;

    var barListAllKeys;
    var barDeleteUnused;
    var barDeleteFolders;

    function listAllKeys(parameters) {

        function list(marker) {
            var storage = services.storage;

            return storage.s3.listObjectsAsync({
                    Bucket: bucket,
                    Marker: marker
                })
                .then(function(data) {

                    barListAllKeys.addLength(data.Contents.length);

                    return Promise.map(data.Contents, function(storageObject) {

                            foundObjects[storageObject.Key] = true;
                            var pathParsed = path.parse(storageObject.Key);

                            while (pathParsed.dir.length) {
                                foundFolders[pathParsed.dir] = true;
                                pathParsed = path.parse(pathParsed.dir);
                            }

                            return Media.findOne({
                                    where: {
                                        location: storageObject.Key
                                    },
                                    fields: {
                                        id: true,
                                        location: true
                                    }
                                })
                                .then(function(objectDB) {

                                    //--------------------------------------------------------
                                    // Update Object

                                    if (objectDB) {

                                        if (!parameters.options.updateCheck) {
                                            return;
                                        }

                                        return getFields()
                                            .then(function(fields) {

                                                var update = false;

                                                for (var key in fields) {
                                                    if (fields[key] != objectDB[key]) {
                                                        update = true;
                                                        break;
                                                    }
                                                }

                                                if (!update) {
                                                    return;
                                                }
                                                //console.log('about to update', fields, Media.definition.name);
                                                return objectDB.updateAttributes(fields)
                                                    .then(function(objectDB) {
                                                        util.log('Updated: ' + objectDB.location);
                                                    });

                                            });


                                    }

                                    //--------------------------------------------------------
                                    // Create Object

                                    return getFields()
                                        .then(function(fields) {
                                            return Media.create(fields);
                                        })
                                        .then(function(objectDB) {
                                            util.log('Created: ' + objectDB.location);
                                        });

                                    //-------------------------------------------------

                                    function getFields() {
                                        return storage.s3.headObjectAsync({
                                                Bucket: bucket,
                                                Key: storageObject.Key
                                            })
                                            .then(function(storageObjectHead) {

                                                return {
                                                    name: path.parse(storageObject.Key).name,
                                                    location: storageObject.Key,
                                                    size: storageObjectHead.ContentLength,
                                                    contentType: storageObjectHead.ContentType,
                                                    type: services.helpers.mediaType(storageObjectHead.ContentType)
                                                };
                                            });
                                    }



                                })
                                .then(function() {
                                    barListAllKeys.tick({
                                        title: storageObject.Key
                                    });
                                });
                        }, {
                            concurrency: 20
                        })
                        .then(function() {
                            if (data.IsTruncated) {
                                return list(_.last(data.Contents).Key);
                            }
                        });
                });
        }

        return list();
    }

    function deleteUnused(skip) {
        skip = skip || 0;
        var length;

        return Media.find({
                where: {
                    type: {
                        neq: 'folder'
                    }
                },
                fields: {
                    id: true,
                    location: true
                },
                limit: 200,
                skip: skip
            }).then(function(result) {

                length = result.length;
                barDeleteUnused.addLength(length);

                return Promise.map(result, function(obj) {

                    var exists = foundObjects[obj.location];

                    return Promise.resolve()
                        .delay(20)
                        .then(function() {

                            if (exists) {
                                return;
                            }

                            return obj.destroy()
                                .then(function() {
                                    util.log('Deleted Missing Folder: ' + obj.location);
                                });

                        })
                        .then(function() {
                            barDeleteUnused.tick({
                                title: obj.location
                            });
                        });
                }, {
                    concurrency: 20
                });

            })
            .then(function() {
                if (length) {
                    skip += length;
                    return deleteUnused(skip);
                }

            });
    }

    function deleteEmptyFolders(skip) {

        skip = skip || 0;
        var length;

        return Media.find({
                where: {
                    type: 'folder'
                },
                fields: {
                    id: true,
                    location: true
                },
                limit: 30,
                skip: skip
            }).then(function(result) {

                length = result.length;
                barDeleteFolders.addLength(length);

                return Promise.map(result, function(obj) {

                    return Promise.resolve()
                        .delay(40)
                        .then(function() {

                            return Media._list(obj.location, 1);

                        })
                        .then(function(result) {
                            if (!result.count) {
                                return obj.destroy()
                                    .then(function() {
                                        util.log('Deleted Empty Folder: ' + obj.location);
                                    });
                            }
                        })
                        .then(function() {
                            barDeleteFolders.tick({
                                title: obj.location
                            });
                        });
                }, {
                    concurrency: 5
                });

            })
            .then(function() {
                if (length) {
                    skip += length;
                    return deleteEmptyFolders(skip);
                }

            });

    }

    function createMissingFolders() {
        var foundFoldersArr = _.keys(foundFolders);

        var bar = util.progress(foundFoldersArr.length, {
            title: 'Create missing folders'
        });

        return Promise.map(foundFoldersArr, function(folderLocation) {

            return Media.findOrCreate({
                    where: {
                        location: folderLocation
                    }
                }, {
                    name: path.parse(folderLocation).name,
                    location: folderLocation,
                    type: 'folder'
                })
                .then(function(res) {

                    bar.tick({
                        title: folderLocation
                    });

                    if (res[1]) {
                        util.log('Created Missing Folder: ' + folderLocation);
                    }
                });

        }, {
            concurrency: 5
        });
    }


    return {
        run: function(parameters) {

            foundFolders = {};
            foundObjects = {};

            parameters.options = parameters.options || {};

            var allKeys;

            //-----------------------------------------------------

            var mediaBucket = configStorage.buckets.media;

            if (parameters.options.private) {
                bucket = mediaBucket.private;
                Media = services.models.Media_Private;
            } else {
                bucket = mediaBucket.name;
                Media = services.models.Media;
            }


            //-----------------------------------------------------

            return Promise.resolve()
                .then(function() {
                    if (parameters.options.skipSync) {
                        return;
                    }
                    barListAllKeys = util.progress(0, {
                        title: 'Check all locations. Create or update if there is a change.'
                    });

                    return listAllKeys(parameters)
                        .then(function(_allKeys) {
                            allKeys = _allKeys;
                            return createMissingFolders();
                        })
                        .then(function() {
                            return Media.count({
                                type: {
                                    neq: 'folder'
                                }
                            }).then(function(totalFiles) {
                                barDeleteUnused = util.progress(totalFiles, {
                                    title: 'Delete unused locations'
                                });
                                return deleteUnused();
                            });

                        })
                        .then(function() {

                            return Media.count({
                                type: 'folder'
                            }).then(function(totalFolders) {
                                barDeleteFolders = util.progress(totalFolders, {
                                    title: 'Delete empty folders'
                                });
                                return deleteEmptyFolders();
                            });

                        });
                })
                .then(function() {

                    if (!parameters.options.generateKeywords) {
                        return;
                    }

                    return require('./search')(util, {
                        model: Media
                    });

                })
                .then(function() {
                    util.log('Sync is complete');
                });
        },
        parameters: [{
            name: 'options',
            title: 'Options',
            type: 'checkboxes',
            values: [{
                name: 'private',
                title: 'Private Media'
            }, {
                name: 'updateCheck',
                title: 'Check for updates'
            }, {
                name: 'generateKeywords',
                title: 'Generate Keywords'
            }, {
                name: 'skipSync',
                title: 'Skip Sync'
            }]
        }]
    };


};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/media/file.js
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
(function() {

    var app = angular.module('MainApp');

    <%-js('media/preview')%>

    app.service('MediaOpt', function(Media, MediaPreview, Media_Private) {

        this.public = {
            api: '<%-config("media.api.public")%>',
            partial: '<%-config("media.partial.public")%>',
            model: Media,
            preview: MediaPreview.public
        };

        this.private = {
            api: '<%-config("media.api.private")%>',
            partial: '<%-config("media.partial.private")%>',
            model: Media_Private,
            preview: MediaPreview.private
        };

    });

    app.service('EditFile', function(Upload, SocketIO, $timeout, $mdDialog, Portal) {

        var socket = Portal.socket.media;

        this.init = function(options) {

            var scope = options.scope;
            var data = options.data;
            var Media = data.media.model;

            if (!data.media.api) {
                throw new Error('API Media base-path is required');
            }

            scope.config = data.config;
            scope.file = {
                dir: data.dir,
                name: data.name
            };

            socket.on('file:upload:progress', function(result) {
                console.log(result.percentage);
                scope.progress = result.percentage;
                scope.$apply();
            });

            socket.on('file:upload:complete', function(result) {
                scope.progress = 100;
                console.log(result);
                setTimeout(function() {
                    scope.progress = null;
                    scope.file = result.file;
                    onFile();
                    scope.$apply();
                }, 400);
            });

            function onChange() {
                if (data.onChange) {
                    data.onChange();
                }
            }

            function onFile() {
                var callback = options.onFile || data.onFile;
                if (callback) {
                    callback(scope.file);
                }
            }

            function onApply() {
                var callback = options.onApply || data.onApply;
                if (callback) {
                    callback(scope.file);
                }
            }

            function load() {

                if (!data.location) {
                    return;
                }

                scope.loading = true;

                Media.details({
                        id: data.file && data.file.id,
                        location: options.data.location
                    })
                    .$promise
                    .then(function(result) {

                        if (result.notfound) {
                            console.warn(result.notfound);
                            return;
                        }

                        if (result.deleted) {
                            console.warn(result.deleted);
                            return;
                        }

                        angular.extend(scope.file, result);
                        onFile();
                    })
                    .finally(function() {
                        scope.loading = false;
                    });

            }

            load();

            scope.cancel = function() {
                $mdDialog.cancel();
            };

            scope.save = function() {

                scope.loading = true;

                Media.updateFile({
                        id: scope.file.id,
                        name: scope.file.name,
                        contentType: scope.file.contentType,
                        dir: scope.file.dir,
                        roles: scope.file.roles
                    })
                    .$promise
                    .then(function(result) {
                        scope.file = result.file;
                        onFile();
                        onApply();
                        $mdDialog.hide();
                    })
                    .finally(function() {
                        onChange();
                        scope.loading = false;
                    });
            };

            scope.select = function() {
                $mdDialog.open({
                    nested: true,
                    partial: 'select',
                    data: {
                        media: data.media,
                        file: scope.file,
                        onSelect: function(object) {
                            scope.file = object;
                            onFile();
                        }
                    }
                });
            };

            scope.delete = function() {

                $mdDialog.open({
                    nested: true,
                    partial: 'confirm',
                    data: {
                        onConfirm: function() {

                            scope.loading = true;

                            Media.deleteObject({
                                    location: scope.file.location
                                })
                                .$promise
                                .then(function() {
                                    if (data.onDelete) {
                                        data.onDelete();
                                    }
                                })
                                .finally(function() {
                                    onChange();
                                    $mdDialog.hide();
                                    scope.loading = false;
                                });

                        }
                    }
                });

            };

            scope.upload = function(object) {

                if (object) {
                    //console.log(scope.file.location);
                    Upload.upload({
                        url: agneta.url(data.media.api + 'upload-file'),
                        data: {
                            dir: scope.file.dir,
                            name: scope.file.name,
                            location: scope.file.location,
                            object: object
                        },
                        arrayKey: ''
                    }).then(function(response) {
                        console.log(response);
                    });
                }
            };
        };
    });

    app.controller('MediaSelect', function($scope, $controller, data, $mdDialog) {

        $scope.startingLocation = data.file.dir;

        $scope.openObject = function(object) {
            data.onSelect(object);
            $mdDialog.hide();
        };

        $scope.onObjects = function(objects) {
            for (var index in objects) {
                var object = objects[index];
                if (object.location == data.file.location) {
                    object.selected = true;
                    break;
                }
            }
        };

        angular.extend(this, $controller('MediaCtrl', {
            MediaOpt: data.media,
            $scope: $scope
        }));


    });

    app.controller('EditFile', function($scope, $controller, data, EditFile,MediaOpt) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        data.config = data.config || {};

        //-------------------------------------------------------------

        data.media = data.media || MediaOpt.public;
        var MediaPreview = data.media.preview;

        //-------------------------------------------------------------

        if (data.location && !data.dir) {
            var dir = data.location.split('/');
            dir.pop();
            data.dir = dir.join('/');
        }

        $scope.getIcon = function() {

            var icon = MediaPreview.objectIcon($scope.file);
            if (!icon) {
                icon = MediaPreview.getUrl('icons/agneta/media');
            }
            return icon;
        };

        EditFile.init({
            data: data,
            scope: $scope,
            onFile: function(file) {
                console.log(file);
                if (file.location) {
                    $scope.preview_src = MediaPreview.image(file, 'medium');
                }

                if (data.onFile) {
                    data.onFile(file);
                }
            }
        });

    });

    app.controller('EditFilePrivate', function($scope, $controller, data, MediaOpt, Account) {

        var onFile = data.onFile;
        var items;
        var fuse;

        data.onFile = function(file) {
            file.roles = file.roles || [];
            if (onFile) {
                onFile(file);
            }
        };

        data.media = MediaOpt.private;

        $scope.loading = true;
        Account.roles()
            .$promise
            .then(function(result) {
                $scope.loading = false;

                items = result;
                fuse = new Fuse(items, {
                    shouldSort: true,
                    keys: ['name']
                });

            });

        var roles = {
            items: items,
            query: function(query) {
                if (!items) {
                    return;
                }
                var results = query ? fuse.search(query) : items;

                var roles = [];
                for (var key in results) {
                    roles.push(results[key].name);
                }

                return roles;
            }
        };

        $scope.roles = roles;


        angular.extend(this, $controller('EditFile', {
            $scope: $scope,
            data: data
        }));

    });

})();

(function() {

    var app = angular.module('MainApp');

    app.controller("FileUploader", function(socket) {
        socket.on('file:upload:error', function(error) {
            console.error(error);
        });
        socket.on('file:upload:progress', function(result) {
            //  console.log(result);
        });
        socket.on('file:upload:created', function(result) {
            console.log(result);
        });
        socket.on('file:upload:complete', function(result) {
            //console.log(result);
        });
    });

    <%-js('media/preview')%>

    app.service('EditFile', function(Upload, SocketIO, $timeout, $mdDialog) {

        var socket = SocketIO.connect('media');

        this.init = function(options) {

            var scope = options.scope;
            var data = options.data;
            var Media = data.Media;

            if (!data.apiMedia) {
                throw new Error('API Media base-path is required');
            }

            scope.config = data.config;
            scope.file = {
                dir: data.dir
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

                Media.updateFile(scope.file)
                    .$promise
                    .then(function(result) {
                        scope.file = result.file;
                        onFile();
                        onApply();
                    })
                    .finally(function() {
                        onChange();
                        scope.loading = false;
                        $mdDialog.hide();
                    });
            };

            scope.select = function() {
                $mdDialog.open({
                    nested: true,
                    partial: 'select',
                    data: {
                        Media: Media,
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
                        url: agneta.url(data.apiMedia + 'upload-file'),
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
            Media: data.Media,
            $scope: $scope
        }));


    });

    app.controller('EditFile', function($scope, $controller, data, EditFile, MediaPreview) {

        MediaPreview = data.MediaPreview || MediaPreview.init();

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        data.config = data.config || {};

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
                    switch (file.type) {
                        case 'image':
                            $scope.accept = 'image/*';
                            $scope.preview_src = MediaPreview.getUrl(file, 'medium');
                            break;
                        default:
                    }
                }

                if (data.onFile) {
                    data.onFile(file);
                }
            }
        });

    });

    app.controller('EditFilePrivate', function($scope, $controller, data, EditFile, MediaPreview) {

        angular.extend(this, $controller('EditFile', {
            $scope: $scope,
            data: data
        }));

    });

})();

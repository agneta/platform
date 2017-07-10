(function() {

    var app = angular.module('MainApp');

    app.controller('MediaCtrl', function($scope, $rootScope, Upload, MediaOpt, SocketIO, $timeout, $mdToast, $mdDialog, $location, $sce, $routeParams, Search_Engine) {

        var apiMedia = MediaOpt.api;
        var partialFile = MediaOpt.partial;
        var Media = MediaOpt.model;
        var MediaPreview = MediaOpt.preview;

        if (MediaOpt.public) {
            apiMedia = MediaOpt.public.api;
            partialFile = MediaOpt.public.partial;
            Media = MediaOpt.public.model;
            MediaPreview = MediaOpt.public.preview;
        }

        if (MediaOpt.private) {
            if ($rootScope.viewData.extra && $rootScope.viewData.extra.private) {
                apiMedia = MediaOpt.private.api;
                partialFile = MediaOpt.private.partial;
                Media = MediaOpt.private.model;
                MediaPreview = MediaOpt.private.preview;
            }
        }

        Search_Engine.init({
            scope: $scope,
            model: Media,
            keywords: agneta.get_asset('generated/keywords_media.json'),
            onResult: function(result) {
                for (var index in result.items) {
                    var object = result.items[index];
                    MediaPreview.set(object);
                }
            }
        });

        MediaPreview.toScope($scope);

        var dirRoot = {
            name: 'root',
            location: ''
        };

        $scope.dirs = [dirRoot];

        //-----------------------------------------

        $scope.openFolder = function(location) {

            $scope.searchClear();

            location = location || '';
            location = location.location || location;

            var dirs = location.split('/');
            var locations = [];
            var result = [dirRoot];
            for (var i in dirs) {

                i /= 1;

                var dir = dirs[i];

                if (!dir || !dir.length) {
                    continue;
                }

                locations.push(dir);

                result.push({
                    name: dir,
                    location: locations.join('/')
                });


            }

            $scope.dirs = result;
            $scope.selectDir($scope.dirs[result.length - 1]);

        };

        var startingLocation = $scope.startingLocation || $routeParams.location;

        $scope.selectDir = function(dir) {
            $scope.dir = dir;
            $scope.refresh();
        };

        <%-js('edit/media/directory')%>

        $scope.openFolder(startingLocation);

    });

})();

(function() {

    var app = angular.module('MainApp');

    app.controller('MediaCtrl', function($scope, $rootScope, Upload, Media, SocketIO, $timeout, $mdToast, $mdDialog, $location, $sce, $routeParams, MediaPreview, Search_Engine) {

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
            var result = [dirRoot];
            var locations = [];
            for (var i in dirs) {

                i /= 1;

                var dir = dirs[i];

                if (!dir || !dir.length) {
                    continue;
                }

                locations.push(dir);

                var value = {
                    name: dir,
                    location: locations.join('/')
                };

                var tab = $scope.dirs[i + 1] || {};
                if (tab.name != value.name) {
                    $scope.dirs[i + 1] = value;
                }

            }
            var j = locations.length + 1;
            while (j < $scope.dirs.length) {
                $scope.dirs.pop();
                j++;
            }

            $scope.selectDir($scope.dirs[locations.length]);

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

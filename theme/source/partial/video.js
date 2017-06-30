(function() {

    var app = window.angular.module('MainApp');

    app.controller('VideoCtrl', function($scope, data) {

        var sources = [];
        for (var i in data.sources) {
            var source = data.sources[i];
            sources.push({
                src: agneta.get_media(source.src),
                type: source.type
            });
        }

        $scope.config = {
            sources: sources,
            theme: agneta.get_lib('videogular.min.css')
        };
    });

})();

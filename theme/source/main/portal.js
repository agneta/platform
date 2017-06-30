(function() {

    var app = window.angular.module('MainApp');

    app.service('Portal', function(SocketIO, $rootScope, $route, $timeout) {

        var socket = SocketIO.connect('portal');
        this.socket = socket;

        socket.on('page-saved', function(id) {

            if ($rootScope.viewData.path == id) {

                socket.once('page-reload', function() {
                    $timeout(function() {
                        $route.reload();
                    }, 10);
                });

            }
        });

    });

    app.directive('portalEdit', function(Portal, $rootScope) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {

                var contentId = elem.attr('portal-edit');
                var listener = 'content-change:' + $rootScope.viewData.path + ':' + contentId;
                //console.log(listener);

                Portal.socket.on(listener, function(data) {

                    //console.log(data);
                    var value = data.value;
                    if (angular.isObject(value)) {
                        value = agneta.lng(value);
                    }
                    elem.html(value || '');
                });



            }
        };
    });

})();

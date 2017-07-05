(function() {

    var app = angular.module('MainApp');

    app.factory('SocketIO', function($mdDialog) {
        //Creating connection with server

        function connect(name) {

            var socket = io.connect(agneta.host, {
                path: '/socket/' + name
            });

            socket.on('unauthorized', function() {
                error({
                    title: 'Unauthorized',
                    content: 'You are not able to connect with the socket server because you have unauthorized access privileges.'
                });
            });

            socket.on('error', function(err) {
              /*
                error({
                    title: 'Socket Error',
                    content: err
                });*/
            });

            function error(options) {

                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: agneta.partial('error'),
                    locals: {
                        data: options
                    },
                    controller: 'DialogController'
                });

            }

            return socket;

        }

        return {
            connect: connect
        };

    });

})();

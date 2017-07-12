(function() {

    var app = angular.module('MainApp');

    app.factory('SocketIO', function($mdDialog) {

        var socket = socketCluster.connect({
            host: agneta.services.host,
            path: '/socket'
        });

        socket.on('connect', function() {
            console.log('CONNECTED');
        });

        socket.on('unauthorized', function() {
            console.error({
                title: 'Unauthorized',
                content: 'You are not able to connect with the socket server because you have unauthorized access privileges.'
            });
        });

        socket.on('error', function(err) {
            console.error(err);
            /*
              error({
                  title: 'Socket Error',
                  content: err
              });*/
        });

        function connect(namespace) {

            return {
                on: function(name, cb) {
                    var channel = socket.subscribe(getName(name));
                    channel.watch(cb);
                },
                emit: function(name, data) {
                    socket.publish(getName(name), data);
                },
                removeAllListeners: function(name) {
                    socket.unsubscribe(getName(name));
                }
            };

            function getName(name) {
                return namespace + '.' + name;
            }

        }



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

        return {
            connect: connect
        };

    });

})();

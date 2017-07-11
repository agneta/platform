const _ = require('lodash');

module.exports = function(options) {

    var worker = options.worker;

    if(!worker){
      return;
    }
    
    var app = options.app;
    var server = worker.scServer;
    var cookieParser = require('cookie-parser')(
        app.get("cookie_secret")
    );

    var connections = {};
    var namespaces = {};
    var socket = {};

    socket.namespace = function(options) {

        namespaces[options.name] = options;
        return namespaceMethods(options.name);

    };

    function namespaceMethods(namespace, socket) {
        var _socket;
        if (socket) {
            _socket = socket.exchange || socket;
        }
        _socket = _socket || server.exchange;

        var result = {
            on: function(name, cb) {

                switch (name) {
                    case 'connection':
                        return server.on(name, function(socket) {
                            return cb(namespaceMethods(namespace, socket));
                        });
                }

                var channel = _socket.subscribe(namespace + '.' + name);
                return channel.watch(cb);
            },
            emit: function(name, data) {
                return _socket.publish(namespace + '.' + name, data);
            }
        };

        if (socket) {
            result.request = socket.request;
        } else {
            result.currentConnection = function(req) {
                var sessionId = req.session.id;
                return namespaceMethods(namespace, connections[sessionId]);
            };

        }

        return result;

    }

    server.addMiddleware(server.MIDDLEWARE_HANDSHAKE, function(req, next) {

        req.header = function(name) {
            return req.headers[name];
        };
        req.app = app;

        cookieParser(req, null, function() {

            app.token.middleware(req, null, function(err) {

                if (err) {
                    return next(err);
                }

            });

        });


        next();
    });

    server.addMiddleware(server.MIDDLEWARE_SUBSCRIBE, function(req, next) {

        var socket = req.socket;
        var request = req.socket.request;
        var parts = req.channel.split('.');
        var name = parts[0];

        if (name) {

            var namespace = namespaces[name];

            if (namespace) {
                var auth = namespace.auth;

                if (auth) {
                    if (auth.allow) {

                        var authenticated = false;

                        var allow = _.zipObject(
                            auth.allow,
                            _.map(auth.allow, function() {
                                return true;
                            })
                        );

                        var token = request.accessToken;

                        if (token) {

                            for (var key in allow) {
                                if (token.roles[key]) {
                                    authenticated = true;
                                    break;
                                }
                            }

                        }

                        if (!authenticated) {
                            socket.emit('unauthorized', {
                                channel: req.channel
                            });
                            return next(`You are not able to access this channel (${req.channel}).`);
                        }

                    }
                }



            }
        }

        next();


    });

    server.on('connection', function(socket) {

        var client = server.clients[socket.id];
        client.headers = socket.request.headers;

        var sessionId = _.get(socket, 'request.signedCookies.agneta_session');

        if (!sessionId) {
            return;
        }

        connections[sessionId] = socket;

        socket.on('disconnect', function() {
            delete connections[sessionId];
        });
    });

    socket.server = server;
    app.socket = socket;

};

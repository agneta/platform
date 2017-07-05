var socketio = require('socket.io');
var _ = require('lodash');
const redis = require('socket.io-redis');

module.exports = function(app) {

    var cookieParser = require('cookie-parser')(
        app.get("cookie_secret")
    );

    var connectionsAll = {};
    var mainApp = app.get('options').mainApp;
    function create(options) {
        var io = mainApp.sockets.of(options.name);

      //  io.adapter(redis({ host: 'localhost', port: 6379 }));

        var connections = connectionsAll[options.name] = {};

        io.use(function(socket, next) {

            var req = socket.request;

            req.header = function(name) {
                return req.headers[name];
            };
            req.app = app;

            cookieParser(req, null, function() {
                app.token.middleware(req, null, function(err) {
                    if (err) {
                        return next(err);
                    }

                    if (options.auth) {
                        var authenticated = false;

                        if (options.auth.allow) {

                            var allow = _.zipObject(
                                options.auth.allow,
                                _.map(options.auth.allow, function() {
                                    return false;
                                })
                            );

                            if (req.accessToken) {

                                for (var key in allow) {
                                    if (req.accessToken.roles[key]) {
                                        authenticated = true;
                                        break;
                                    }
                                }

                            }
                        }

                        if (!authenticated) {

                            return next({
                                title: 'Unauthorized access',
                                message: 'You are not able to access this socket path. It is most likely because you do have an allowed role.'
                            });

                        }
                    }

                    next();
                });

            });

        });

        io.on('connection', function(connection) {
            sessionId = _.get(connection, 'request.signedCookies.agneta_session');

            if (!sessionId) {
                return;
            }

            connections[sessionId] = connection;

            connection.on('disconnect', function() {
                delete connections[sessionId];
            });
        });

        io.currentConnection = function(req) {
            var sessionId = req.session.id;
            return connections[sessionId];
        };

        return io;

    }

    app.io = {
        create: create
    };

};

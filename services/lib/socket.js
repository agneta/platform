/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/socket.js
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
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app, options) {
  var io = options.io;
  if (!io) {
    app.socket = {
      namespace: function() {
        return {
          on: function() {},
          emit: function() {}
        };
      }
    };
    return;
  }
  var cookieParser = require('cookie-parser')(app.secrets.get('cookie'));

  var connections = {};
  var namespaces = {};
  var socket = {};

  socket.namespace = function(options) {
    options.io = io.of(`/${options.name}`);
    namespaces[options.name] = options;
    return options.io;
  };

  io.use(function(socket, next) {
    console.log(socket);
    var req;
    req.header = function(name) {
      return req.headers[name];
    };
    req.app = app;

    cookieParser(req, null, function() {
      Promise.resolve()
        .then(function() {
          function check() {
            if (!app.token) {
              return Promise.delay(500).then(check);
            }

            return Promise.resolve();
          }

          return check();
        })
        .then(function() {
          app.token.middleware(req, null, next);
          return null;
        })
        .catch(next);
    });
  });

  io.use(function(socket, next) {
    var req;
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
              socket.kickOut(req.channel);
              return;
            }
          }
        }
      }
    }

    next();
  });

  io.on('connection', function(socket) {
    var client = io.clients[socket.id];
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

  socket.io = io;
  app.socket = socket;
};

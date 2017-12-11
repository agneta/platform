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

module.exports = function(options) {

  var worker = options.appOptions.worker;
  var app = options.app;
  if(!worker){
    app.socket = {
      namespace: function(){
        return {
          on: function(){

          },
          emit: function(){

          }
        };
      }
    };
    return;
  }
  var server = worker.scServer;
  var cookieParser = require('cookie-parser')(
    app.secrets.get('cookie',true)
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

      Promise
        .resolve()
        .then(function(){

          function check(){

            if(!app.token){
              return Promise.delay(500)
                .then(check);
            }

            return Promise.resolve();

          }

          return check();

        })
        .then(function(){
          app.token.middleware(req, null, next);
          return null;
        })
        .catch(next);

    });
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

              socket.kickOut(req.channel);
              return;
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

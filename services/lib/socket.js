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
const events = require('events');

module.exports = function(app, options) {
  var io = options.io;
  if (!io) {
    app.socket = {
      room: function() {
        return {
          on: function() {},
          emit: function() {}
        };
      }
    };
    return;
  }
  var cookieParser = require('cookie-parser')(app.secrets.get('cookie'));

  var rooms = {};
  let result = {};

  result.room = function(options) {
    _.defaultsDeep(options, {
      auth: {
        allow: []
      }
    });

    if (!options.auth.allow.length) {
      options.auth.skip = true;
    }

    options.auth.allow = _.zipObject(
      options.auth.allow,
      _.map(options.auth.allow, function() {
        return true;
      })
    );

    var roomName = options.name;

    var em = new events.EventEmitter();

    var socket = {
      on: em.on,
      once: em.once,
      emit: function(name, data) {
        return io.sockets.to(roomName).emit(getPath(name), data);
      }
    };

    options.emmiter = em;
    options.socket = socket;
    rooms[options.name] = options;

    return socket;

    function getPath(name) {
      return `${roomName}.${name}`;
    }
  };

  function makeRequest(socket) {
    var req = socket.request;
    req.header = function(name) {
      return req.headers[name];
    };
    req.app = app;
    return req;
  }

  io.use(function(socket, next) {
    //console.log(socket.handshake);
    var req = makeRequest(socket);

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

  io.on('connection', function(socket) {
    socket.use(function(packet, callback) {
      function emit() {
        var event = {
          name: packet[0],
          data: packet[1]
        };

        var nameParsed = event.name.split('.');
        var roomName = nameParsed.shift();
        var method = nameParsed.join('.');

        if (!roomName) {
          return;
        }

        if (!socket.rooms[roomName]) {
          return;
        }

        var roomConfig = rooms[roomName];

        if (!roomConfig) {
          return;
        }

        roomConfig.emmiter.emit(method);
      }

      emit();
      callback();
    });
    socket.on('join', function(roomName) {
      var allowed = isAllowed({
        room: roomName,
        request: socket.request
      });

      if (allowed) {
        //console.log('Socket joined ' + roomName);
        socket.join(roomName);
      }
    });
  });

  function isAllowed(options) {
    var roomConfig = rooms[options.room];
    if (!roomConfig) {
      return;
    }
    if (roomConfig.auth.skip) {
      return true;
    }
    var token = options.request.accessToken;
    if (token) {
      for (var key in roomConfig.auth.allow) {
        if (token.roles[key]) {
          return true;
        }
      }
    }
  }

  result.io = io;
  app.socket = result;
};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/server/index.js
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
const SFTPSession = require('./session');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug');
const ssh2 = require('ssh2');
const extend = require('./extend');
const ContextWrapper = require('./context');

extend(SFTPServer, EventEmitter);

function SFTPServer(options) {
  // Expose options for the other classes to read.
  if (!options) options = {};
  if (typeof options === 'string') options = {
    privateKeyFile: options
  }; // Original constructor had just a privateKey string, so this preserves backwards compatibility.

  SFTPServer.options = options;

  this.server = new ssh2.Server({
    hostKeys: [options.privateKey]
  }, (function(_this) {

    return function(client, info) {

      client.on('error', function(err) {
        debug('SFTP Server: error');
        return _this.emit('error', err);
      });

      client.on('authentication', function(ctx) {
        debug('SFTP Server: on(\'authentication\')');
        _this.auth_wrapper = new ContextWrapper(ctx, _this);
        return _this.emit('connect', _this.auth_wrapper, info);
      });

      client.on('end', function() {
        debug('SFTP Server: on(\'end\')');
        return _this.emit('end');
      });

      return client.on('ready', function() {
        client._sshstream.debug = debug;
        return client.on('session', function(accept) {
          var session;
          session = accept();
          return session.on('sftp', function(accept) {
            var sftpStream;
            sftpStream = accept();
            session = new SFTPSession(sftpStream,SFTPServer);
            return _this._session_start_callback(session);
          });
        });
      });
    };
  })(this));
}

SFTPServer.prototype.listen = function(port) {
  return this.server.listen(port);
};

module.exports = SFTPServer;

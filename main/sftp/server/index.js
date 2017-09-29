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

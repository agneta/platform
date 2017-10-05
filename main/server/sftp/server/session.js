const Statter = require('./statter');
const ssh2_stream = require('ssh2-streams');
const SFTP = ssh2_stream.SFTPStream;
const fs = require('fs');
const ssh2 = require('ssh2');
const extend = require('./extend');
const debug = require('debug');
const slice = [].slice;
const DirectoryEmitter = require('./dirEmmiter');
const Responder = require('./responder');
const EventEmitter = require('events').EventEmitter;
const Readable = require('stream').Readable;
const tmp = require('tmp');

extend(SFTPSession, EventEmitter);

SFTPSession.Events = [
  'REALPATH', 'STAT', 'LSTAT', 'FSTAT',
  'OPENDIR', 'CLOSE', 'REMOVE', 'READDIR',
  'OPEN', 'READ', 'WRITE', 'RENAME',
  'MKDIR', 'RMDIR'
];

function SFTPSession(sftpStream1,server) {
  var event, fn, i, len, ref;
  this.server = server;
  this.sftpStream = sftpStream1;
  this.max_filehandle = 0;
  this.handles = {};
  ref = this.constructor.Events;
  fn = (function(_this) {
    return function(event) {
      return _this.sftpStream.on(event, function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        debug('DEBUG: SFTP Session Event: ' + event);
        return _this[event].apply(_this, args);
      });
    };
  })(this);
  for (i = 0, len = ref.length; i < len; i++) {
    event = ref[i];
    fn(event);
  }
}

SFTPSession.prototype.fetchhandle = function() {
  var prevhandle;
  prevhandle = this.max_filehandle;
  this.max_filehandle++;
  return new Buffer(prevhandle.toString());
};

SFTPSession.prototype.REALPATH = function(reqid, path) {
  var callback;
  if (EventEmitter.listenerCount(this, 'realpath')) {
    callback = (function(_this) {
      return function(name) {
        return _this.sftpStream.name(reqid, {
          filename: name,
          longname: '-rwxrwxrwx 1 foo foo 3 Dec 8 2009 ' + name,
          attrs: {}
        });
      };
    })(this);
    return this.emit('realpath', path, callback);
  } else {
    return this.sftpStream.name(reqid, {
      filename: path,
      longname: path,
      attrs: {}
    });
  }
};

SFTPSession.prototype.do_stat = function(reqid, path, kind) {
  if (EventEmitter.listenerCount(this, 'stat')) {
    return this.emit('stat', path, kind, new Statter(this.sftpStream, reqid));
  } else {
    console.log('WARNING: No stat function for ' + kind + ', all files exist!');
    return this.sftpStream.attrs(reqid, {
      filename: path,
      longname: path,
      attrs: {}
    });
  }
};

SFTPSession.prototype.STAT = function(reqid, path) {
  return this.do_stat(reqid, path, 'STAT');
};

SFTPSession.prototype.LSTAT = function(reqid, path) {
  return this.do_stat(reqid, path, 'LSTAT');
};

SFTPSession.prototype.FSTAT = function(reqid, handle) {
  return this.do_stat(reqid, this.handles[handle].path, 'FSTAT');
};

SFTPSession.prototype.OPENDIR = function(reqid, path) {
  var diremit;
  diremit = new DirectoryEmitter(this.sftpStream, reqid);
  diremit.on('newListener', (function(_this) {
    return function(event) {
      var handle;
      if (event !== 'dir') {
        return;
      }
      handle = _this.fetchhandle();
      _this.handles[handle] = {
        mode: 'OPENDIR',
        path: path,
        loc: 0,
        responder: diremit
      };
      return _this.sftpStream.handle(reqid, handle);
    };
  })(this));
  return this.emit('readdir', path, diremit);
};

SFTPSession.prototype.READDIR = function(reqid, handle) {
  var ref;
  if (((ref = this.handles[handle]) != null ? ref.mode : void 0) !== 'OPENDIR') {
    return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.NO_SUCH_FILE);
  }
  return this.handles[handle].responder.request_directory(reqid);
};

SFTPSession.prototype.OPEN = function(reqid, pathname, flags) {
  var handle, rs, started, stringflags;
  stringflags = SFTP.flagsToString(flags);
  switch (stringflags) {
    case 'r':
      // Create a temporary file to hold stream contents.
      var options = {};
      if (this.server.options.temporaryFileDirectory) options.dir = this.server.options.temporaryFileDirectory;
      return tmp.file(options, function(err, tmpPath, fd) {
        if (err) throw err;
        handle = this.fetchhandle();
        this.handles[handle] = {
          mode: 'READ',
          path: pathname,
          finished: false,
          tmpPath: tmpPath,
          tmpFile: fd
        };
        var writestream = fs.createWriteStream(tmpPath);
        writestream.on('finish', function() {
          this.handles[handle].finished = true;
        }.bind(this));
        this.emit('readfile', pathname, writestream);
        return this.sftpStream.handle(reqid, handle);
      }.bind(this));
    case 'w':
      rs = new Readable();
      started = false;
      rs._read = (function(_this) {
        return function() {
          if (started) {
            return;
          }
          handle = _this.fetchhandle();
          _this.handles[handle] = {
            mode: 'WRITE',
            path: pathname,
            stream: rs
          };
          _this.sftpStream.handle(reqid, handle);
          return started = true;
        };
      })(this);
      return this.emit('writefile', pathname, rs);
    default:
      return this.emit('error', new Error('Unknown open flags: ' + stringflags));
  }
};

SFTPSession.prototype.READ = function(reqid, handle, offset, length) {
  var localHandle = this.handles[handle];

  // Once our readstream is at eof, we're done reading into the
  // buffer, and we know we can check against it for EOF state.
  if (localHandle.finished) {
    return fs.stat(localHandle.tmpPath, function(err, stats) {
      if (err) throw err;

      if (offset >= stats.size) {
        return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.EOF);
      } else {
        var buffer = Buffer.alloc(length);
        return fs.read(localHandle.tmpFile, buffer, 0, length, offset, function(err, bytesRead, buffer) {
          return this.sftpStream.data(reqid, buffer.slice(0, bytesRead));
        }.bind(this));
      }
    }.bind(this));
  }

  // If we're not at EOF from the buffer yet, we either need to put more data
  // down the wire, or need to wait for more data to become available.
  return fs.stat(localHandle.tmpPath, function(err, stats) {
    if (stats.size >= offset + length) {
      var buffer = Buffer.alloc(length);
      return fs.read(localHandle.tmpFile, buffer, 0, length, offset, function(err, bytesRead, buffer) {
        return this.sftpStream.data(reqid, buffer.slice(0, bytesRead));
      }.bind(this));
    } else {
      // Wait for more data to become available.
      setTimeout(function() {
        this.READ(reqid, handle, offset, length);
      }.bind(this), 50);
    }
  }.bind(this));
};

SFTPSession.prototype.WRITE = function(reqid, handle, offset, data) {
  this.handles[handle].stream.push(data);
  return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.OK);
};

SFTPSession.prototype.CLOSE = function(reqid, handle) {
  //return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.OK);
  if (this.handles[handle]) {
    switch (this.handles[handle].mode) {
      case 'OPENDIR':
        this.handles[handle].responder.emit('end');
        delete this.handles[handle];
        return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.OK);
      case 'READ':
        delete this.handles[handle];
        return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.OK);
      case 'WRITE':
        this.handles[handle].stream.push(null);
        //delete this.handles[handle]; //can't delete it while it's still going, right?
        return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.OK);
      default:
        return this.sftpStream.status(reqid, ssh2.SFTP_STATUS_CODE.FAILURE);
    }
  }
};

SFTPSession.prototype.REMOVE = function(reqid, path) {
  return this.emit('delete', path, new Responder(this.sftpStream, reqid));
};

SFTPSession.prototype.RENAME = function(reqid, oldPath, newPath) {
  return this.emit('rename', oldPath, newPath, new Responder(this.sftpStream, reqid));
};

SFTPSession.prototype.MKDIR = function(reqid, path) {
  return this.emit('mkdir', path, new Responder(this.sftpStream, reqid));
};

SFTPSession.prototype.RMDIR = function(reqid, path) {
  return this.emit('rmdir', path, new Responder(this.sftpStream, reqid));
};

module.exports = SFTPSession;

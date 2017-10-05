const Responder = require('./responder');
const extend = require('./extend');

extend(DirectoryEmitter, Responder);

function DirectoryEmitter(sftpStream1, req1) {
  this.sftpStream = sftpStream1;
  this.req = req1 != null ? req1 : null;
  this.stopped = false;
  this.done = false;
  DirectoryEmitter.__super__.constructor.call(this, sftpStream1, this.req);
}

DirectoryEmitter.prototype.request_directory = function(req) {
  this.req = req;
  if (!this.done) {
    return this.emit('dir');
  } else {
    return this.end();
  }
};

DirectoryEmitter.prototype.file = function(name, attrs) {

  if (typeof attrs === 'undefined') {
    attrs = {};
  }

  var date = `${attrs.mtime.getMonth()} ${attrs.mtime.getDate()} ${attrs.mtime.getFullYear()}`;
  var longname = `${attrs.permissions} 1 ${attrs.uid} ${attrs.gid} ${attrs.size||0} ${date} ${name}`;

  this.stopped = this.sftpStream.name(this.req, {
    filename: name.toString(),
    longname: longname,
    attrs: attrs
  });

  if (!this.stopped && !this.done) {
    return this.emit('dir');
  }
};

module.exports = DirectoryEmitter;

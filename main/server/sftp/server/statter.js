var constants = require('constants');
var ssh2 = require('ssh2');

function Statter(sftpStream1, reqid1) {
  this.sftpStream = sftpStream1;
  this.reqid = reqid1;
}

Statter.prototype.is_file = function() {
  return this.type = constants.S_IFREG;
};

Statter.prototype.is_directory = function() {
  return this.type = constants.S_IFDIR;
};

Statter.prototype.file = function() {
  return this.sftpStream.attrs(this.reqid, this._get_statblock());
};

Statter.prototype.nofile = function() {
  return this.sftpStream.status(this.reqid, ssh2.SFTP_STATUS_CODE.NO_SUCH_FILE);
};

Statter.prototype._get_mode = function() {
  return this.type | this.permissions;
};

Statter.prototype._get_statblock = function() {
  return {
    mode: this._get_mode(),
    uid: this.uid,
    gid: this.gid,
    size: this.size,
    atime: this.atime,
    mtime: this.mtime
  };
};

module.exports = Statter;

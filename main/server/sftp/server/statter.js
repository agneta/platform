/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/server/statter.js
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

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/server/dirEmmiter.js
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

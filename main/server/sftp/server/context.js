/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/server/context.js
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
var tmp = require('tmp');
tmp.setGracefulCleanup();

function ContextWrapper(ctx1, server) {
  this.ctx = ctx1;
  this.server = server;
  this.method = this.ctx.method;
  this.username = this.ctx.username;
  this.password = this.ctx.password;
}

ContextWrapper.prototype.reject = function(methodsLeft, isPartial) {
  return this.ctx.reject(methodsLeft, isPartial);
};

ContextWrapper.prototype.accept = function(callback) {
  if (callback == null) {
    callback = function() {};
  }
  this.ctx.accept();
  return this.server._session_start_callback = callback;
};

module.exports = ContextWrapper;

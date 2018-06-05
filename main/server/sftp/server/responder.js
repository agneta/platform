/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/server/responder.js
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
const ssh2 = require('ssh2');
const extend = require('./extend');
const EventEmitter = require('events').EventEmitter;

extend(Responder, EventEmitter);

Responder.Statuses = {
  'denied': 'PERMISSION_DENIED',
  'nofile': 'NO_SUCH_FILE',
  'end': 'EOF',
  'ok': 'OK',
  'fail': 'FAILURE',
  'bad_message': 'BAD_MESSAGE',
  'unsupported': 'OP_UNSUPPORTED'
};

function Responder(sftpStream1, req1) {

  var fn, methodname, ref, symbol;
  this.req = req1;
  this.sftpStream = sftpStream1;
  ref = this.constructor.Statuses;

  fn = (function(_this) {
    return function(symbol) {
      return _this[methodname] = function() {
        _this.done = true;
        return _this.sftpStream.status(_this.req, ssh2.SFTP_STATUS_CODE[symbol]);
      };
    };
  })(this);

  for (methodname in ref) {
    symbol = ref[methodname];
    fn(symbol);
  }

}

module.exports = Responder;

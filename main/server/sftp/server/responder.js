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

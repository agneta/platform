const Readable = require('stream').Readable;
const extend = require('./extend');

extend(SFTPFileStream, Readable);

function SFTPFileStream() {
  return SFTPFileStream.__super__.constructor.apply(this, arguments);
}

SFTPFileStream.prototype._read = function() {};

module.exports = SFTPFileStream;

const SFTPServer = require('node-sftp-server');
const path = require('path');

var keyPath = path.join(process.cwd(), 'tmp', 'private.key');
//write private key
var server = new SFTPServer({
  privateKeyFile: keyPath
});
//delete private key

server.listen();

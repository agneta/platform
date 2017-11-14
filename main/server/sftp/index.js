/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/index.js
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
const SFTPServer = require('./server');
const path = require('path');
const services = require('../services');
const auth = require('./auth');
const fs = require('fs-extra');
module.exports = function(options) {

  var server;
  var tmpDir = path.join(process.cwd(), 'tmp', 'sftp');
  var app;

  return fs.ensureDir(tmpDir)
    .then(services)
    .then(function(result) {
      app = result.services.app;
      server = new SFTPServer({
        privateKey: options.protocolOptions.key,
        temporaryFileDirectory: tmpDir
      });
    })
    .then(function() {

      auth(server, app);
      // User disconnects from the server
      server.on('end', function() {
        console.log('user disconnected');
      });

      //
      server.on('error', function(error) {
        console.error(error);
      });

      server.listen(process.env.PORT);

      console.log('SFTP is listening to port', process.env.PORT);

    });

  //delete private key

};

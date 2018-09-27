/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/config.js
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
const error = require('./error');
const configstore = require('configstore');
const path = require('path');
const fs = require('fs');

var port = parseFloat(process.env.PORT) || 8181;
var hostName = process.env.HOST_NAME || 'localhost';
var host = process.env.ENDPOINT || 'localhost';
var env = process.env.NODE_ENV || 'development';

//-------------------------------------

if (!port) {
  error.config(port, 'PORT');
}

var appConfigPath = path.join(process.cwd(), 'config.json');
var appConfig = {};

if (fs.existsSync(appConfigPath)) {
  appConfig = require(appConfigPath);
}

var result = {
  port: port,
  host: host,
  app: appConfig,
  env: env,
  hostName: hostName,
  socket: {
    path: '/socket'
  }
};

result.agneta = new configstore('global', null, {
  globalConfigPath: true
});

module.exports = result;

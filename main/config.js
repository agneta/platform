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
var error = require('./error');

var env = process.env.NODE_ENV;
var port = parseFloat(process.env.PORT);
var protocol = process.env.PROTOCOL;
var hostName = process.env.HOST_NAME;
var host = process.env.ENDPOINT;

//-------------------------------------

if (!port) {
  error.config(port, 'PORT');
}

var result = {
  port: port,
  host: host,
  protocol: protocol,
  env: env,
  hostName: hostName,
  socket: {
    path: '/socket'
  },
};

console.log(result);

module.exports = result;

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
var url = require('url');
var _ = require('lodash');
var path = require('path');
var error = require('./error');

var projectPaths = require('./paths').project;
var projectOptions;

var env = process.env.NODE_ENV || 'development';

try {
  projectOptions = require(path.join(projectPaths.project, 'config'));
} catch (e) {
  projectOptions = {};
}

projectOptions = projectOptions[env] || {};

_.extend(projectOptions, {
  port: 8080,
  protocol: 'http',
  hostName: 'localhost'
});

var port = parseFloat(process.env.PORT || projectOptions.port);
var protocol = process.env.PROTOCOL || projectOptions.protocol;
var hostName = process.env.HOST_NAME || projectOptions.hostName;

//-------------------------------------

if (process.env.APP_HOST) {
  var hostParsed = url.parse(process.env.APP_HOST);
  protocol = hostParsed.protocol;
  if (protocol) {
    protocol = protocol.split(':')[0];
  }
}

var host = process.env.APP_HOST ||
    process.env.HOST ||
    url.format({
      protocol: protocol,
      hostname: hostName,
      port: port
    });

process.env.WEBSITE = host;

//-------------------------------------

if (!port) {
  error.config(port, 'PORT');
}

module.exports = _.extend(projectOptions, {
  port: port,
  host: host,
  protocol: protocol,
  env: env,
  hostName: hostName,
  socket: {
    path: '/socket'
  },
});

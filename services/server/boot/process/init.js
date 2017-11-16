/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/process/init.js
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
const publicIp = require('public-ip');
const _ = require('lodash');
const url = require('url');

module.exports = function(app) {

  var processProps = {
    host: process.env.HOST_NAME,
    env: process.env.NODE_ENV,
    mode: process.env.MODE
  };

  var Process = app.models.Process;
  var Process_Server = app.models.Process_Server;

  var serverName = app.configstore.get('server.name');
  if (!serverName) {
    throw new Error('Your agneta configuration does not have a value at: server.name');
  }

  var processServer;
  var serverProps = {
    name: serverName
  };

  // Get or set
  return Process_Server.findOne({
    where: serverProps
  })
    .then(function(_processServer) {
      processServer = _processServer;
      return publicIp.v4()
        .then(function(ip) {
          serverProps.ipv4 = ip;
        });
    })
    .then(function() {

      if (!processServer) {
        return Process_Server.create(serverProps);
      }
      return processServer.updateAttributes(serverProps);

    })
    .then(function(_processServer) {

      processServer = _processServer;

      return Process.findOne({
        where: processProps
      });

    })
    .then(function(result) {

      var endpoint = url.format({
        protocol: process.env.PROTOCOL,
        hostname: process.env.HOST_NAME,
        pathname: app.get('services_url')
      });

      _.extend(processProps, {
        lastStarted: new Date(),
        branch: app.git.branch.current,
        endpoint: endpoint,
        processServerId: processServer.id
      });

      if (!result) {
        return Process.create(processProps);
      }
      return result.updateAttributes(processProps);
    });

};

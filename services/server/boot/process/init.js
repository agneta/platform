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
const Promise = require('bluebird');
const publicIp = require('public-ip');


module.exports = function(app) {

  var props = {
    host: process.env.HOST_NAME,
    env: process.env.NODE_ENV,
    mode: process.env.MODE
  };

  return Promise.map(['v4'/*, 'v6'*/], function(method) {
    return publicIp[method]()
      .then(function(ip) {
        props[`ip${method}`] = ip;
      });
  })
    .then(function() {
      console.log(props);
      return app.models.Process.find();
    });

};

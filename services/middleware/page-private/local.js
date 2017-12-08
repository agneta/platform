/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/middleware/page-private/local.js
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
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

module.exports = function(app) {

  var client = app.get('options').client;
  var project = client.project;

  return function(data) {

    var pagePath = path.join(project.paths.app.build, 'local', 'private', data.remotePath,'index.html');

    if (!fs.existsSync(pagePath)) {
      return Promise.reject({
        notfound: true
      });
    }

    var readStream = fs.createReadStream(pagePath);

    data.res.set('Content-Encoding','gzip');
    data.res.set('Content-Type','text/html; charset=utf-8');

    readStream.pipe(data.res);

  };

};

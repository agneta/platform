/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/not-found.js
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
const urljoin = require('urljoin');
const _ = require('lodash');
const url = require('url');
const request = require('request');

module.exports = function(app) {

  var project = app.get('options').client.project;
  var storageConfig = app.get('storage');

  return function(req, res) {

    var lang = _.get(project.config, 'language.default.key') || 'en';
    var pathname = urljoin(lang, 'error/not-found');

    var reqPath = url.format({
      hostname: storageConfig.buckets.assets.host,
      protocol: 'https',
      pathname: pathname
    });

    request
      .get(reqPath)
      .pipe(res);

  };
};

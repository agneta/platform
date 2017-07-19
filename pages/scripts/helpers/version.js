/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/version.js
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
var path = require('path');
var url = require('url');
var _ = require('lodash');
var urljoin = require('url-join');
var request = require('request-promise');
var chalk = require('chalk');

module.exports = function(locals) {

  var project = locals.project;
  var defaultTime = new Date();

  project.extend.helper.register('getVersion', function(url, time) {

    time = time || defaultTime;

    if (_.isString(time)) {
      version = time;
    }

    if (time.valueOf) {
      version = time.valueOf();
    }

    if (!url) {
      return version;
    }

    return urljoin(
      url,
      '?version=' + version
    );

  });

};

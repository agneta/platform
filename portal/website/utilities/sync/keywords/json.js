/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/keywords/json.js
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
var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');
var fs = require('fs-extra');
var outputJson = Promise.promisify(fs.outputJson);

module.exports = function(util, options) {

  var webProject = util.locals.web.project;

  return function(data) {

    data = data || {};

    var lang = data.language;
    var keywords = _.keys(util.keywords.dict);
    var filename = options.filename({
      language: lang
    }) + '.json';
    var filePath = path.join(webProject.paths.app.services,'keywords', filename);

    return outputJson(filePath, keywords)
      .then(function() {
        util.success(keywords.length + ' keywords are written to: ' + filePath);
      });
  };
};

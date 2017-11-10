/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/services.js
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

const _ = require('lodash');
const request = require('request');
const url = require('url');

var projectPaths = require('../paths').core;
var config = require('../config');
var start = require('../start');
module.exports = function(options) {

  options = options || {};

  var webPages = start.default({
    load: {
      media: false
    },
    host: config.host
  });

  var project;
  var languages;
  var storageConfig;

  options.app.use(function(req, res, next) {

    var pathParts = req.path.split('/');

    pathParts = pathParts.filter(function(n) {
      return _.isString(n) && n.length;
    });

    if (pathParts.length == 0 ||
      languages[pathParts[0]]
    ) {

      var reqPath = url.format({
        hostname: storageConfig.buckets.assets.host,
        protocol: 'https',
        pathname: req.path
      });

      request
        .get(reqPath)
        .pipe(res);
      return;

    }

    next();
  });

  var services = start.services({
    worker: options.worker,
    dir: projectPaths.project,
    client: webPages.locals,
    server: options.server,
    app: options.app
  });

  webPages.locals.services = services.locals.app;
  services.locals.client = webPages.locals;

  return start.init([
    services,
    webPages
  ])
    .then(function() {
      project = webPages.locals.project;
      languages = _.get(project, 'site.languages');
      storageConfig = services.locals.app.get('storage');
    });

};

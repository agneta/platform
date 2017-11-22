/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/live.js
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
const url = require('url');
const request = require('request');

module.exports = function(options){

  var languages;
  var storageConfig;

  var project;

  require('./services')(options)
    .then(function(result) {
      project = result.webPages.locals.project;
      languages = _.get(project, 'site.languages');
      storageConfig = result.services.locals.app.get('storage');

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

    });




};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/start.js
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
const log = require('./log');
const paths = require('./paths');
const projectPaths = paths.project;
const config = require('./config');
const Promise = require('bluebird');

var start = {
  init: function(subApps) {
    return Promise.each(subApps, function(component) {
      log.info('Initiating: ' + component.locals.app.get('title'));
      if (component.init) {
        return component.init();
      }
    })
      .then(function() {
        return Promise.each(subApps, function(component) {
          log.info('Starting: ' + component.locals.app.get('title'));
          if (component.start) {
            return component.start();
          }
        });
      });
  },
  default: function() {

    return start.pages({
      mode: 'default'
    });

  },
  portal: function(locals) {

    return start.pages({
      mode: 'preview',
      dir: projectPaths.portalWebsite,
      locals: locals
    });
  },
  website: function(locals) {

    return start.pages({
      mode: 'preview',
      sync: true,
      locals: locals
    });
  },
  pages: function(options) {

    options.locals = options.locals || {};
    options.paths = paths.get(options);

    _.extend(options.locals, config);

    var result = require(options.paths.framework)(options);
    return result;
  },
  services: function(options) {

    return require(projectPaths.services)(options);

  }
};

module.exports = start;

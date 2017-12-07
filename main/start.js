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
const paths = require('./paths');
const config = require('./config');
const Promise = require('bluebird');
var ProgressBar = require('progress');

_.mixin(require('lodash-deep'));


var start = {
  init: function(subApps) {

    var bar = new ProgressBar('[:bar] :title', {
      total: subApps.length * 2 + 1,
      width: 30
    });

    return Promise.each(subApps, function(component) {
      if (component.preInit) {
        return component.preInit();
      }
    })
      .then(function() {
        return Promise.each(subApps, function(component) {
          bar.tick({
            title: 'Initiating: ' + component.locals.app.get('name')
          });
          if (component.init) {
            return component.init();
          }
        });
      })
      .then(function() {
        return Promise.each(subApps, function(component) {
          bar.tick({
            title: 'Starting: ' + component.locals.app.get('name')
          });
          if (component.start) {
            return component.start();
          }
          return null;
        });
      })
      .then(function() {
        bar.tick({
          title: ''
        });
      });
  },
  default: function(options) {

    var component = start.pages({
      mode: 'default',
      locals: options
    });

    return component;

  },
  portal: function(options) {

    options.includeSources = [{
      name: 'portal',
      path: paths.core.portalProjectSource
    }];

    var component = start.pages({
      mode: 'preview',
      dir: paths.core.portalWebsite,
      locals: options
    });

    setName(component, 'pages_portal', options);
    return component;
  },
  website: function(options) {

    var component = start.pages({
      mode: 'preview',
      sync: true,
      locals: options
    });

    setName(component, 'pages_website', options);
    return component;
  },
  pages: function(options) {
    options.paths = paths.app(options);
    return getComponent('pages', '../pages', options);
  },
  services: function(options) {

    options.paths = paths.core;
    return getComponent('services', paths.core.services, options);

  }
};

function getComponent(name, componentPath, options) {

  _.extend(options, config);

  var component = require(componentPath)(options);

  setName(component, name, options);

  return component;

}

function setName(component, name, options) {
  options = options || {};
  if (options.id) {
    name += '_' + options.id;
  }
  component.locals.app.set('name', name);

}

module.exports = start;

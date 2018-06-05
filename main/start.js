'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
var _ = require('lodash');
var paths = require('./paths');
var config = require('./config');
var Promise = require('bluebird');
_.mixin(require('lodash-deep'));
_.omitDeep = function (collection, excludeKeys) {
  function omitFn(value) {
    if (value && typeof value === 'object') {
      excludeKeys.forEach(function (key) {
        delete value[key];
      });
    }
  }
  return _.cloneDeepWith(collection, omitFn);
};
var start = {
  init: function (subApps) {
    return Promise.each(subApps, function (component) {
      if (component.preInit) {
        return component.preInit();
      }
    })
      .then(function () {
        return Promise.each(subApps, function (component) {
          console.log('Initissating: ' + component.locals.app.get('name'));
          if (component.init) {
            return component.init();
          }
        });
      })
      .then(function () {
        return Promise.each(subApps, function (component) {
          console.log('Starting: ' + component.locals.app.get('name'));
          if (component.start) {
            return component.start();
          }
          return null;
        });
      });
  },
  default: function (options) {
    var component = start.pages(_.extend({
      mode: 'default'
    }, options));
    return component;
  },
  portal: function (options) {
    options.includeSources = [{
      name: 'portal',
      path: paths.appPortal.source
    }];
    var component = start.pages({
      mode: 'preview',
      dir: paths.portal.base,
      locals: options
    });
    setName(component, 'pages_portal', options);
    return component;
  },
  website: function (options) {
    var component = start.pages({
      mode: 'preview',
      sync: true,
      locals: options
    });
    setName(component, 'pages_website', options);
    return component;
  },
  pages: function (options) {
    options.paths = paths.loadApp(options);
    return getComponent('pages', '../pages', options);
  },
  services: function (options) {
    options.paths = paths.loadApp(options);
    return getComponent('services', paths.core.services, options);
  },
  storage: function (options) {
    return getComponent('storage', './server/storage', options);
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
//# sourceMappingURL=start.js.map
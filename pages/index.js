/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/index.js
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
var _ = require('lodash');

module.exports = function(options) {
  options.mode = options.mode || 'default';
  var locals = (options.locals = options.locals || {});
  //--------------------------------------------
  // Loading Config

  locals.load = _.extend(
    {
      scripts: true,
      data: true,
      media: true,
      pages: true
    },
    locals.load || {}
  );

  //-----------------------------------------------------------------

  locals.project = {
    theme: {},
    extend: {},
    env: locals.env || 'development',
    config: {
      permalink: '/:title/',
      new_post_name: ':title.yml',
      root: '/'
    },
    site: {
      set lang(value) {
        var language = locals.project.site.languages[value];
        if (!language) {
          throw new Error(`Language with key "${value}" does not exist`);
        }
        locals.project.site.language = language;
      },
      get lang() {
        return locals.project.site.language.key;
      }
    },
    locals: {
      cache: {
        data: {}
      }
    },
    paths: options.paths,
    render: {}
  };

  Object.defineProperty(locals, 'agneta', {
    get: function() {
      var stack = new Error().stack;
      console.warn('Deprecated method "agneta", will be removed');
      console.log(stack);
      return locals.project;
    }
  });

  //-----------------------------------------------------------------
  // Require main script based on selected mode

  locals.mode = locals.mode || {};
  locals.mode[options.mode] = locals.mode[options.mode] || {};
  var core = require('./core')(options);

  //-----------------------------------------------------------------
  return {
    locals: locals,
    preInit: locals.main.preInit,
    init: function() {
      locals.project.env = locals.env || 'development';
      locals.build_dir = path.join(options.paths.app.build, locals.project.env);

      return locals.main.init().then(function() {
        return locals;
      });
    },
    start: function() {
      return locals.main
        .start()
        .then(function() {
          if (_.isFunction(core.mode)) {
            return core.mode();
          }
        })
        .then(function() {
          return locals;
        });
    }
  };
};

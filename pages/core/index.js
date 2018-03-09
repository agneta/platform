/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/main.js
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

const Loader = require('./load');
const Cache = require('./cache');

module.exports = function(options) {
  var locals = options.locals;
  Cache(locals);

  var load = Loader(locals);
  var project = locals.project;

  require('./compiler')(locals);

  function init() {

    return Promise.resolve()
      .then(function() {
        return require('./project')(locals);
      })
      .then(function() {
        return require('./database')(locals);
      })
      .then(function() {
        return require('./helpers')(locals);
      })
      .then(function() {
        return load.init();
      })
      .then(function() {
        return require('./files')(locals);
      })
      .then(function() {
        return project.call_listeners('initiated');
      });
  }

  function start() {
    return load.start()
      .then(function() {
        return project.call_listeners('ready');
      });
  }


  locals.main = {
    init: init,
    mode: require(`../main/${options.mode}`)(locals),
    start: start,
    load: load,
    preInit: load.preInit
  };

  return locals.main;
};

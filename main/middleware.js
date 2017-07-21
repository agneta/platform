/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/middleware.js
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
var start = require('./start');

module.exports = function(options) {

  var app = options.mainApp;
  var name = options.name || options.root;
  var url = '/' + options.root;

  var title = options.title || name;
  options.url_services = options.url_services || '/';

  var component = start[name](options);
  var componentApp = component.locals.app;

  var appName = name;

  if (options.id) {
    appName += '_' + options.id;
  }

  componentApp.set('name', appName);
  componentApp.set('title', title);

  function init() {
    //console.log('URL:', url);
    app.use(url, componentApp);

    if (component.init) {
      return component.init()
        .then(function() {
          return component.locals;
        });
    }

    return component.locals;
  }

  return {
    init: init,
    preInit: component.preInit,
    start: component.start,
    locals: component.locals
  };
};

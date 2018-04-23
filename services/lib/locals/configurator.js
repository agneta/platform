/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/configurator.js
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
var _ = require('lodash');
var path = require('path');

function deepMerge(object, source) {
  return _.mergeWith(object, source,
    function(objValue, srcValue) {
      if (_.isObject(objValue) && srcValue) {
        return deepMerge(objValue, srcValue);
      }
      return objValue;
    });
}
_.deepMerge = deepMerge;

module.exports = function(app) {

  var servicesDir = app.web.services.get('services_dir');
  var locals = app.web.services.get('options');

  if (process.env.SERVICES_ENV) {
    app.set('env', process.env.SERVICES_ENV);
  }

  var env = app.web.services.get('env');

  //------------------------------------------------------

  switch (env) {
    case 'development':
    case 'local':
      app.set('web_url', locals.host);
      break;
  }

  //console.log('Running on env:',env);

  function data(file) {
    var result = null;
    try {
      result = require(file);
    } catch (e) {
      if (e.code == 'MODULE_NOT_FOUND') {
        if (e.message.indexOf(file) < 0) {
          throw e;
        }
      } else {
        throw e;
      }
    }

    if (_.isFunction(result)) {
      result = result(app);
    }

    return result || {};

  }

  var dirs = [
    path.join(__dirname, '../..'),
  ];



  function load(name,dontInclude) {

    var loadDirs = dirs.concat();
    if(!dontInclude){
      loadDirs = loadDirs.concat(app.web.services.get('services_include'));
    }
    loadDirs = loadDirs.concat(servicesDir);

    var result = {};

    for (var dir of loadDirs) {

      _.merge(
        result,
        data(path.join(dir, name))
      );

      _.merge(
        result,
        data(path.join(dir, name + '.' + env))
      );

    }

    return result;
  }

  app.configurator = {
    load: load
  };

  return app.configurator;

};

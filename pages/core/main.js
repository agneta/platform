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
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const extend = require('../pages/extend');
const database = require('./database');
const Promise = require('bluebird');
const Loader = require('./load');
const Cache = require('./cache');

module.exports = function(locals) {

  Cache(locals);

  var load = Loader(locals);
  var listeners = {};

  ///////////////////////////////////////////
  // GLOBALS
  ///////////////////////////////////////////

  var project = locals.project;

  require('./theme')(locals);

  project.call_listeners = function(listener) {
    // body...
    var list = listeners[listener] || [];
    return Promise.map(list, function(entry) {
      return entry();
    });
  };

  project.extend.filter = new extend.Filter();
  project.extend.generator = new extend.Generator();

  // load filters
  require('../pages/filter')(project);

  ///////////////////////////////////////////
  //
  ///////////////////////////////////////////

  project.render.isRenderable = function() {
    return true;
  };

  project._showDrafts = function() {
    return project.config.render_drafts;
  };

  project.execFilter = function(type, data, options) {
    return project.extend.filter.exec(type, data, options);
  };

  project.execFilterSync = function(type, data, options) {
    return project.extend.filter.execSync(type, data, options);
  };

  function init() {

    database(locals);

    /////////////////////////////////////////////////
    // HELPERS

    var helper = project.extend.helper = {};
    var appLocals = locals.app.locals;

    helper.register = function(name, callback) {

      appLocals[name] = function() {
        return callback.apply(_.extend({},this, appLocals), arguments);
      };

    };

    appLocals.mode = locals.mode;
    appLocals.path = path;
    appLocals.fs = fs;
    appLocals._ = _;
    appLocals.config = project.config;
    appLocals.site = project.site;

    if (locals.web) {
      appLocals.config_prj = locals.web.project.config;
    }

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

    //////////////////////////////////////////////////

    project.on = function(name, callback) {
      var listener = listeners[name] = listeners[name] || [];
      listener.push(callback);
    };

    /////////////////////////////////////////////////////
    return load.init();

  }

  function start() {
    return load.start()
      .then(function() {
        return project.call_listeners('ready');
      });
  }

  //////////////////////////////////////////////////////

  locals.main = {
    init: init,
    start: start,
    load: load
  };

  return locals.main;
};

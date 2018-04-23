/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/language.js
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

module.exports = function(app) {

  var client = app.client;
  var project = client.project;
  var helpers = client.app.locals;
  var config = app.web.services.get('language');

  app.getLng = function(req) {

    var result = (function() {

      if (req.query && req.query.language) {
        return req.query.language;
      }

      if (req.body && req.body.language) {
        return req.body.language;
      }

      return 'en';

    })();

    var language = _.find(project.config.languages, {
      key: result
    });
    if(language && !language.skipBuild){
      return language.key;
    }

    return project.config.language.default.key;

  };

  app.lng = function(obj, lng) {

    if (_.isObject(lng)) {
      lng = app.getLng(lng);
    }

    if (_.isString(obj)) {
      obj = _.get(config,obj) || obj;
    }

    if (_.isObject(obj)) {
      obj = obj.__value || obj;
    }

    return helpers.lng(obj,lng);
  };

  app.lngScan = function(obj, lng) {

    if (_.isObject(lng)) {
      lng = app.getLng(lng);
    }

    return helpers.lngScan(obj, lng);
  };

};

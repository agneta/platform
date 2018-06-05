/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/activity_item/getInfo.js
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
var Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');

module.exports = function(Model) {

  var infoMethods = {};

  Model.registerInfo = function(type, method) {

    infoMethods[type] = method;
  };

  Model.getInfo = function(activity, req) {

    activity = activity.__data || activity;

    var type = (activity.action && activity.action.type) ||
            activity.action_type;

    if (!type) {
      return Promise.resolve(activity);
    }

    return Promise.resolve()
      .then(function() {

        var method = infoMethods[type];

        if (!method) {
          activity.title = _.get(activity,'data.message') || _.get(activity,'action.value');
          if(!activity.title){
            console.warn('No title found for activity:',activity);
            activity.title = 'untitled';
          }
          return activity;
        }
        return method(activity, req);

      })
      .then(function(result) {
        return result || activity;
      });

  };

  Model.registerInfo('form', function(activity) {
    var params = activity.data.request.params;

    activity.title = [params.first_name, params.last_name].join(' ');
    activity.subtitle = params.email;
    activity.modal = 'activity-form';

  });

  Model.registerInfo('error', function(activity) {

    var error = activity.data.error || activity.data;
    if (!error) {
      //console.log(activity.data);
      return;
    }

    if (error.message) {
      if (error.message.indexOf('\n') > 0) {
        error.message = error.message.split('\n');
        error.message = error.message[error.message.length - 1];
      }
    }

    activity.title = error.message || error.code || error.name;

    if (error.stack) {
      var entry = error.stack[0];
      if(entry && entry.file){
        var file = path.parse(entry.file).base;
        activity.subtitle = `${file} [${entry.lineNumber},${entry.column}]`;
      }
    }

  });

};

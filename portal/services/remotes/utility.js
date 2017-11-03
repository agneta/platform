/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/utility.js
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
var shortid = require('shortid');

module.exports = function(Model, app) {

  Model.io = app.socket.namespace({
    name: 'utilities',
    auth: {
      allow: [
        'administrator'
      ]
    }
  });

  app.helpers.mixin('disableAllMethods', Model);

  var locals = app.get('options').client;
  var project = locals.project;

  for (var key in project.utilities) {

    initUtility(
      project.utilities[key]
    );

  }

  function initUtility(utility) {

    var instance = utility.runner({
      locals: locals,
      log: function() {
        utility.addLine({
          type: 'log',
          arguments: arguments
        });
      },
      success: function() {
        utility.addLine({
          type: 'success',
          arguments: arguments
        });
      },
      progress: function(length, options) {
        var id = shortid.generate();
        var progressOptions = {
          id: id,
          length: length,
          options: options
        };
        utility.emit('progress:new', progressOptions);
        return {
          tick: function(options) {
            options = options || {};
            utility.emit('progress:tick', {
              id: id,
              options: options
            });
          },
          addLength: function(length) {
            progressOptions.length += length;
            utility.emit('progress:update', progressOptions);
          }
        };
      }
    });

    instance.status = {};

    utility.instance = instance;

    utility.emit = function(name, options) {
      Model.io.emit(utility.name + ':' + name, options);
    };

    utility.addLine = function(options) {

      if (options.arguments) {
        var args = Array.prototype.slice.call(options.arguments);
        options.message = args.join(' ');
      }

      utility.emit('addLine', {
        message: options.message,
        type: options.type
      });
    };
  }

  Model.getUtility = function(name) {
    var utility = project.utilities[name];

    if (!utility) {
      return Promise.reject({
        statusCode: 400,
        message: 'Utility not found'
      });
    }

    return Promise.resolve(utility);

  };

  require('./utility/status')(Model, app);
  require('./utility/start')(Model, app);


};

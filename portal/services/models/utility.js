/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/utility.js
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
const Promise = require('bluebird');
const shortid = require('shortid');
const _ = require('lodash');
const util = require('util');

module.exports = function(Model, app) {

  Model.io = app.socket.namespace({
    name: 'utilities',
    auth: {
      allow: [
        'administrator'
      ]
    }
  });

  var locals = app.client;
  var project = locals.project;

  for (var key in project.utilities) {

    initUtility(
      project.utilities[key]
    );

  }

  function initUtility(utility) {

    var instance = utility.runner({
      locals: locals,
      app: app,
      log: function() {
        utility.addLine({
          type: 'log',
          arguments: arguments
        });
      },
      error: function(){
        utility.addLine({
          type: 'error',
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

        var progressOptions = _.extend({
          id: id,
          length: length,
          count: 0
        },options);

        var canEmit = true;

        function emit(options){
          if(!canEmit && progressOptions.count<length){
            return;
          }

          setTimeout(function () {
            canEmit = true;
          }, 100);
          canEmit = false;

          options = options || {};

          progressOptions.value = (progressOptions.count/progressOptions.length).toFixed(2) * 100;
          progressOptions.current = options;

          if(progressOptions.count==length){
            options.title = 'Complete';
            progressOptions.compete = true;
          }

          utility.emit('progress:update',progressOptions);
        }

        return {
          emit: function(progress,options){
            progressOptions.length = progress.length;
            progressOptions.count = progress.count;
            emit(options);
          },
          tick: function(options) {

            progressOptions.count++;
            emit(options);

          },
          addLength: function(length) {
            progressOptions.length += length;
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
        for(var index in args){
          args[index] = util.inspect(args[index],{depth:4});
        }
        options.message = args.join(' ');
      }

      utility.emit('addLine', {
        message: options.message,
        type: options.type
      });
    };

    utility.emit('status', instance.status);

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

  require('./utility/state')(Model, app);
  require('./utility/start')(Model, app);


};

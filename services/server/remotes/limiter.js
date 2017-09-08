/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/limiter.js
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
var _ = require('lodash');

module.exports = function(Model, app) {

  Model.clearAll = function(req) {

    return Promise.map(_.keys(app.locals.limiters), function(name) {
      var limiter = app.locals.limiters[name];
      return new Promise(function(resolve, reject) {

        limiter.reset(req.ip, null, function(err) {
          if(err){
            reject(err);
          }
          resolve();
        });

      });

    })
      .then(function(){
        return {
          success: 'All Limits are now cleared'
        };
      });

  };

  Model.remoteMethod(
    'clearAll', {
      description: 'Search for a page using fuzzy search capabilities',
      accepts: [{
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/clear-all'
      }
    }
  );


};

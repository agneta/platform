/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/010-activity.js
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
const _ = require('lodash');

module.exports = function(app) {

  function authCheck(ctx) {

    var Activity_Feed = ctx.method.ctor.getModel('Activity_Feed');
    var auth = _.get(app.get('activity'), 'auth');
    var req = ctx.req;

    var params = req.query || req.body;

    //console.log('activity_count:authCheck:auth', auth);
    //console.log('activity_count:authCheck:params', params);

    return Promise.resolve()
      .then(function() {

        if (params.feed) {
          return Activity_Feed.findById(params.feed, {
            fields: {
              type: true
            }
          })
            .then(function(feed) {
              if (!feed) {
                return Promise.reject({
                  statusCode: 401,
                  message: `Could not find feed ${params.feed}`
                });
              }
              return feed.type;
            });
        }

        return params.type;
      })
      .then(function(type) {

        //console.log('activity_count:authCheck:type', type);

        var allowRoles = ['administrator'];

        if (type) {
          allowRoles = allowRoles.concat(auth.allow[type]);
        }
        return app.models.Account.hasRoles(allowRoles, req);
      })
      .then(function(result) {

        if (!result.has) {
          return Promise.reject({
            statusCode: 401,
            message: result.message
          });
        }
      });
  }

  app.activity = {
    authCheck: authCheck
  };

};

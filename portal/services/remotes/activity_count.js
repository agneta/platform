/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/activity_count.js
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
module.exports = function(Model, app) {


  Model.remoteMethod(
    'details', {
      description: 'Get Count Details',
      accepts: [{
        arg: 'feed',
        type: 'string',
        required: true
      }, {
        arg: 'period',
        type: 'string',
        required: true
      }, {
        arg: 'value',
        type: 'number',
        required: false
      }, {
        arg: 'year',
        type: 'number',
        required: false
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/details'
      },
    }
  );

  Model.remoteMethod(
    'totalsByType', {
      description: '',
      accepts: [{
        arg: 'type',
        type: 'string',
        required: true
      }, {
        arg: 'period',
        type: 'string',
        required: true
      }, {
        arg: 'value',
        type: 'number',
        required: false
      }, {
        arg: 'year',
        type: 'number',
        required: false
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/totals-by-type'
      },
    }
  );

  Model.remoteMethod(
    'totals', {
      description: '',
      accepts: [{
        arg: 'feed',
        type: 'string',
        required: true
      }, {
        arg: 'period',
        type: 'string',
        required: true
      }, {
        arg: 'value',
        type: 'number',
        required: false
      }, {
        arg: 'year',
        type: 'number',
        required: false
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/totals'
      },
    }
  );

  var authCheck = function(ctx) {

    var Activity_Feed = Model.getModel('Activity_Feed');
    var auth = _.get(app.get('activity'), 'auth');
    var req = ctx.req;

    var params = req.query || req.body;

    console.log('activity_count:authCheck:auth', auth);
    console.log('activity_count:authCheck:params', params);

    return Promise.resolve()
      .then(function() {

        if (params.feed) {
          return Activity_Feed.findById(params.feed, {
            fields: {
              type: true
            }
          })
            .then(function(feed) {
              if(!feed){
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

        if (!type) {
          return Promise.reject({
            message: 'Need type to examine authentication'
          });
        }

        //console.log('activity_count:authCheck:type', type);

        var allowRoles = _.uniq(
          ['administrator'].concat(auth.allow[type])
        );

        return app.models.Account.hasRoles(allowRoles, req);
      })
      .then(function(result) {

        if (!result.has) {
          return Promise.reject({
            statusCode: 401,
            message: 'You are not allowed to access this feed'
          });
        }
      });
  };

  Model.beforeRemote('details', authCheck);
  Model.beforeRemote('totals', authCheck);
  Model.beforeRemote('totalsByType', authCheck);


  Model.beforeRemote('totals', checkPeriod);
  Model.beforeRemote('totalsByType', checkPeriod);

  function checkPeriod(ctx, instance, next) {

    var period = ctx.req.query.period;

    switch (period) {
      case 'year':
      case 'month':
      case 'week':
      case 'dayOfYear':
        break;
      default:

        var err = new Error('Entered an invalid period');
        err.statusCode = 400;
        err.code = 'INVALID_PERIOD';

        return next(err);

    }

    next();

  }

};

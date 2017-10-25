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

module.exports = function(Model,app) {


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

  Model.beforeRemote('details', app.activity.authCheck);
  Model.beforeRemote('totals', app.activity.authCheck);
  Model.beforeRemote('totalsByType', app.activity.authCheck);


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

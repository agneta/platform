/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/activities.js
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
module.exports = function(Model, app) {

  Model.activities = function(unit, value, skip, year,aggregate, req) {

    var accountId = req.accessToken.userId;
    return Model.activitiesAdmin(accountId, unit, value, skip, year,aggregate, req);

  };

  Model.activitiesAdmin = function(accountId, unit, value, skip, year, aggregate) {

    return app.models.Activity_Feed.findOne({
      where: {
        and: [{
          type: 'account'
        }, {
          value: '_' + accountId
        }]
      }
    })
      .then(function(feed) {
        if (!feed) {
          return {
            message: 'Feed not found for account',
            activities: []
          };
        }

        return app.models.Activity_Item.latest(
          feed.id,
          unit, value, skip, year, aggregate
        );
      });

  };


  Model.remoteMethod(
    'activities', {
      description: 'Get latest activities of authenticated user.',
      accepts: [{
        arg: 'unit',
        type: 'string',
        required: true
      }, {
        arg: 'value',
        type: 'number',
        required: false
      }, {
        arg: 'skip',
        type: 'number',
        required: false
      }, {
        arg: 'year',
        type: 'number',
        required: false
      },
      {
        arg: 'aggregate',
        type: 'string',
        required: false
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }
      ],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/activities'
      },
    }
  );


};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/activity_item.js
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
var moment = require('moment');
var Promise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;

module.exports = function(Model, app) {


  require('../mixins/disableAllMethods')(Model);

  require('./activity_item/getInfo')(Model, app);

  Model.new = function(options) {

    if (!options.action) {
      throw new Error('Action is required');
    }

    var Feed = Model.getModel('Activity_Feed');
    var utc = moment.utc();

    options.feeds = options.feeds || (options.feed ? [options.feed] : []) || [];

    var feedAction = {
      value: options.action.value || options.action,
      type: options.action.type || 'action'
    };

    var feedOptions = [feedAction];

    options.accountId = options.accountId || _.get(options, 'req.accessToken.userId');

    //-------------------------------------------------
    // Account feed

    if (options.accountId) {
      feedOptions.push({
        value: '_' + options.accountId,
        type: 'account'
      });
    }

    //-------------------------------------------------
    // IP feed

    var reqIp = _.get(options, 'req.ip');
    if (reqIp) {
      feedOptions.push({
        value: reqIp,
        type: 'ip'
      });
    }

    //-------------------------------------------------

    for (var feedOption of options.feeds) {

      if (!feedOption) {
        continue;
      }

      if (_.isObject(feedOption) && !feedOption.value) {
        console.error('feedOption must have value');
        continue;
      }

      feedOptions.push({
        value: feedOption.value || feedOption,
        type: feedOption.type || 'category'
      });

    }

    var feeds;

    return Promise.map(feedOptions, function(feedOption) {

      return Feed.findOrCreate(feedOption)
        .then(function(feed) {
          feed = feed[0];
          return feed;
        });
    })
      .then(function(_feeds) {

        feeds = _feeds;
        feedAction = feeds[0];

        var feedIds = _.map(feeds, 'id');
        var data = options.data || {};

        if (options.req && options.req.dataParsed) {
          _.extend(data, {
            request: options.req.dataParsed
          });
        }

        var createOptions = {
          accountId: options.accountId,
          actionId: feedAction.id,
          year: utc.year(),
          month: utc.month(),
          week: utc.week(),
          dayOfYear: utc.dayOfYear(),
          hourOfYear: utc.hourOfYear(),
          time: utc.toDate(),
          data: data,
          feeds: feedIds
        };

        return Model.create(createOptions);

      })
      .then(function(activity) {

        Promise.map(feeds, function(feed) {
          return feed.onUpdate(activity);
        });
        return activity;

      });
  };

  ////////////////////////////////////////////////////////


  Model.details = function(id) {
    return Model.findById(id);
  };

  ////////////////////////////////////////////////////////

  Model.latest = function(feed, unit, value, skip, year, aggregate, req) {

    var Feed = Model.getModel('Activity_Feed');
    var result = {};
    var limit = 10;

    ////////////////////////////////////////////

    var utc = moment().utc();

    if (year) {
      utc.year(year);
    } else {
      year = utc.year();
    }

    if (value) {
      utc[unit](value);
    } else {
      value = utc[unit]();
    }

    result.value = value;

    ////////////////////////////////////////////

    var where = {};
    where[unit] = value;

    return Promise.resolve()
      .then(function() {

        if (aggregate) {

          if (feed) {
            where.feeds = {
              $in: [ObjectID(feed)],
            };
            where.actionId = {
              $exists: true
            };
          }

          var aggregateId = {
            'actionId': '$actionId'
          };
          aggregateId[aggregate] = '$' + aggregate;

          return Model.dataSource.connector.collection('Activity_Item')
            .aggregate([{
              $match: where
            },
            {
              '$group': {
                '_id': aggregateId,
                'count': {
                  '$sum': 1
                },
                'time': {
                  '$max': '$time'
                }
              }
            },
            {
              '$sort': {
                'time': -1
              }
            },
            {
              '$limit': limit
            }
            ])
            .toArray()
            .then(function(activities) {
              return Promise.mapSeries(activities, function(activity) {
                if (!activity._id.actionId) {
                  return activity;
                }
                return Feed
                  .findById(activity._id.actionId)
                  .then(function(action) {
                    return Feed.getInfo(action);
                  })
                  .then(function(action) {
                    activity.action = action;
                    return activity;
                  });
              });
            });

        }

        if (feed) {
          where.feeds = { in: [ObjectID(feed)]
          };
        }

        return Model.find({
          include: 'action',
          where: where,
          limit: limit,
          order: 'time DESC',
          skip: skip
        })
          .then(function(activities) {
            return Promise.mapSeries(activities, function(activity) {
              return Model.getInfo(activity, req)
                .then(function(result) {
                  result = _.pick(result, [
                    'title',
                    'subtitle',
                    'id',
                    'modal',
                    'time'
                  ]);
                  result.path = _.get(activity, 'data.request.path');
                  return result;
                });
            });
          });
      })

      .then(function(activities) {
        result.activities = activities;
        return result;
      });


  };

  ////////////////////////////////////////////////////////////////////////////////

  Model.beforeRemote('latest', function(ctx, instance, next) {

    var unit = ctx.req.query.unit;

    switch (unit) {
      case 'year':
      case 'month':
      case 'dayOfYear':
      case 'hourOfYear':
        return next();
    }

    var err = new Error('Entered an invalid unit');
    err.statusCode = 400;
    err.code = 'INVALID_UNIT';

    return next(err);

  });

};

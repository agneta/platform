var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;

module.exports = function(Model) {

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

    var where = {};

    if (unit) {

      if (value) {
        utc[unit](value);
      } else {
        value = utc[unit]();
      }

      result.value = value;
      where[unit] = value;

    }

    ////////////////////////////////////////////


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

          return Model.getCollection('Activity_Item')
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
    if (unit) {
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
    }


  });
};

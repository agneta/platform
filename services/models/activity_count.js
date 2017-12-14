/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/activity_count.js
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
var moment = require('moment');
var _ = require('lodash');

module.exports = function(Model) {

  

  Model.details = function(feedId, period, value, year) {

    var Feed = Model.getModel('Activity_Feed');

    return Feed.findById(feedId)
      .then(function(feed) {

        if (!feed) {
          return {
            error: 'Feed not found'
          };
        }

        var utc = moment().utc();

        if (year) {
          utc.year(year);
        } else {
          year = utc.year();
        }

        if (value) {
          utc[period](value);
        } else {
          value = utc[period]();
        }

        return feed.getCount({
          type: period,
          year: year,
          key: value
        });
      });

  };


  Model.totalsByType = function(type, period, value, year) {

    var Feed = Model.getModel('Activity_Feed');
    var prep = preparePeriod(period, value, year);

    prep.result.feeds = [];

    return Feed.getByType(type)
      .then(function(feeds) {

        return Promise.map(feeds, function(feed) {

          return getTotals(
            feed.id,
            prep
          )
            .then(function(result) {

              if (!result.total) {
                return;
              }

              prep.result.feeds.push(
                _.extend({}, feed.__data || feed, result));
            });
        });
      })
      .then(function() {
        return prep.result;
      });
  };

  /////////////////////////////////////////////////////////////////

  Model.totals = function(feedId, period, value, year) {

    var prep = preparePeriod(period, value, year);

    return getTotals(
      feedId,
      prep
    )
      .then(function(result) {
        return _.extend(prep.result, result);
      });

  };



  /////////////////////////////////////////////////////////////////

  function getTotals(feedId, prep) {

    var range = prep.range;
    var unit = prep.unit;
    var year = prep.year;

    var result = {
      counts: []
    };

    return Model.findOne({
      fields: {
        total: true
      },
      where: {
        feedId: feedId,
        type: prep.result.period,
        key: prep.result.value
      }
    })
      .then(function(count) {

        if (!count) {
          return;
        }

        if (!count.total) {
          return;
        }

        result.total = count.total;

        return Model.find({
          fields: {
            key: true,
            total: true
          },
          where: {
            feedId: feedId,
            type: unit,
            year: year,
            key: {
              between: [range[0], range[range.length - 1]]
            }
          }
        });
      })
      .then(function(counts) {

        if (!counts) {
          return;
        }

        counts = _.keyBy(counts, 'key');

        for (var key of range) {
          var count = counts[key];
          if (count) {
            count.total = count.total || 0;
            result.counts.push(count);
            continue;
          }
          result.counts.push({
            key: key,
            total: 0,
            not_found: true
          });
        }

      })
      .then(function() {
        return result;
      });
  }
  /////////////////////////////////////////////////////////////////

  function preparePeriod(period, value, year) {

    var range;
    var subUnit;
    var start;
    var length;
    var unit;

    switch (period) {
      case 'year':
        unit = 'month';
        break;
      case 'month':
        unit = 'dayOfYear';
        break;
      case 'dayOfYear':
        unit = 'hourOfYear';
        break;
    }

    var result = {
      year: year,
      period: period,
      unit: unit
    };

    var utc = moment().utc();

    if (year) {
      utc.year(year);
    } else {
      year = utc.year();
    }

    if (value) {
      utc[period](value);
    } else {
      value = utc[period]();
    }

    result.value = value;
    result.period = period;

    switch (unit) {

      case 'month':
        switch (period) {
          case 'year':
            range = _.range(12);
            break;

          default:
        }

        subUnit = 'dayOfYear';
        break;

      case 'dayOfYear':

        switch (period) {
          case 'month':
            start = utc.month(value).date(1).dayOfYear();
            length = utc.month(value).daysInMonth();

            range = _.range(start, start + length);
            break;

          default:
        }

        subUnit = 'hourOfYear';
        break;

      case 'hourOfYear':

        switch (period) {
          case 'dayOfYear':
            start = utc.dayOfYear(value).hour(0).hourOfYear();
            length = 24;

            range = _.range(start, start + length);
            break;

          default:
        }
        break;
    }

    result.subUnit = subUnit;

    if (!range) {

      var err = new Error('Could not calculate the range');
      err.statusCode = 400;
      err.code = 'NO_RANGE_SET';

      throw err;
    }

    return {
      unit: unit,
      range: range,
      year: year,
      result: result
    };

  }

  /////////////////////////////////////////////////////////////////

  Model.prototype.updateTotals = function() {

    var instance = this;

    return instance.activities.count()
      .then(function(count) {
        return instance.updateAttribute('total', count);
      });
  };


  Model.beforeRemote('create', function(ctx, instance, next) {

    Model.findOne({
      where: instance
    })
      .then(function(count) {

        if (!count) {
          return next();
        }

        var msg = 'Count Already Found with same values';
        console.error(msg);

        next({
          msg: msg
        });

      });
  });

};

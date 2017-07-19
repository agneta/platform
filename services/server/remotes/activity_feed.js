/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/activity_feed.js
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
var loopback = require('loopback');
var Promise = require('bluebird');
var _ = require('lodash');
var moment = require('moment');
var S = require('string');
var refreshRate = 3000;

module.exports = function(Model, app) {

  require('../mixins/disableAllMethods')(Model);
  require('./activity_feed/getInfo')(Model, app);

  Model.observe('access', function(ctx) {

    var data = ctx.query.where;

    if (data && data.value) {
      data.value = format(data.value);
    }

    return Promise.resolve();
  });

  Model.observe('before save', function event(ctx, next) {
    var data = ctx.instance || ctx.data;

    if (data.value) {
      data.value = format(data.value);
    }

    next();
  });

  function format(name) {

    res = S(name)
      .collapseWhitespace()
      .trim()
      .s.toLowerCase();

    return res;
  }

  ////////////////////////////////////////////////////////////////////

  Model.getByType = function(type) {

    return Model.find({
      where: {
        type: type
      }
    })
      .then(function(feeds) {
        return Promise.map(feeds, function(feed) {
          return Model.getInfo(feed);
        });
      });

  };

  ////////////////////////////////////////////////////////////////////

  var feedUpdates = {};
  var delayUpdate;

  (function() {

    var updating = false;
    var update = false;

    delayUpdate = function() {

      if (updating) {
        update = true;
        return;
      }

      updating = true;

      setTimeout(function() {


        updateFeeds(_.values(feedUpdates))

          .then(function() {

            update = false;
            updating = false;

            if (update) {
              delayUpdate();
            }

            //console.log('feeds updated');
          });

        feedUpdates = {};

      }, refreshRate);

    };

  })();

  Model.prototype.onUpdate = function(activity) {

    var feedUpdate = feedUpdates[this.id] = feedUpdates[this.id] || {
      id: this.id,
      updates: {}
    };

    var key = activity.year + ':' + activity.hourOfYear;

    var update = feedUpdate.updates[key] = feedUpdate.updates[key] || {
      hour: activity.hourOfYear,
      day: activity.dayOfYear,
      week: activity.week,
      month: activity.month,
      year: activity.year,
      activities: []
    };

    update.activities.push(activity.id);
    delayUpdate();
  };

  var updateQueue = [{
    key: 'days',
    type: 'dayOfYear'
  }, {
    key: 'weeks',
    type: 'week'
  }, {
    key: 'months',
    type: 'month'
  }, {
    key: 'years',
    type: 'year'
  }];

  function updateFeeds(feedUpdates) {

    var Count = Model.getModel('Activity_Count');
    var Activity = Model.getModel('Activity_Item');

    return Promise.map(feedUpdates, function(feedUpdate) {

      var feed;

      return Model.findById(feedUpdate.id)

        .then(function(_feed) {

          feed = _feed;
          var ancestors = {
            days: {},
            weeks: {},
            months: {},
            years: {}
          };

          return Promise.map(_.values(feedUpdate.updates), function(update) {

            return feed.getCount({
              type: 'hourOfYear',
              year: update.year,
              key: update.hour,
              create: true
            })
              .then(function(count) {

                return Activity.count({
                  hourOfYear: update.hour,
                  feeds: {
                    inq: [feed.id]
                  }
                })
                  .then(function(total) {

                    return count.updateAttribute('total', total);

                  })
                  .then(function(count) {
                    var prefix = update.year + ':';

                    ancestors.days[prefix + update.day] = true;
                    ancestors.weeks[prefix + update.week] = true;
                    ancestors.months[prefix + update.month] = true;
                    ancestors.years[prefix + update.year] = true;

                    return count;
                  });

              });
          })
            .then(function() {

              return Promise.each(updateQueue, function(data) {

                return Promise.each(Object.keys(ancestors[data.key]), function(key) {

                  key = parseUpdateKey(key);
                  var count = null;

                  return feed.getCount({
                    type: data.type,
                    year: key.year,
                    key: key.value,
                    create: true
                  })
                    .then(function(_count) {

                      count = _count;

                      return Count.find({
                        limit: 0,
                        where: {
                          parentId: count.id
                        }
                      });

                    })
                    .then(function(children) {
                      //console.log(key, count.id, children.length);
                      var total = children.reduce(function(last, child) {
                        return child.total + (last || 0);
                      }, 0);

                      return count.updateAttribute('total', total);
                    });
                });

              });


              function parseUpdateKey(key) {
                key = key.split(':');
                return {
                  year: key[0],
                  value: key[1]
                };
              }

            })
            .then(function() {
              Model.emit('activity-update', feed);
            });
        });
    })
      .catch(function(err) {
        console.error(err);
      });

  }

  Model.prototype.getCount = function(options) {
    var Count = Model.getModel('Activity_Count');
    var instance = this;

    var countProps = {
      feedId: instance.id,
      type: options.type,
      year: options.year,
      key: options.key
    };

    return Count.findOne({
      where: countProps
    })
      .then(function(count) {

        if (count) {
          return count;
        }

        if (!options.create) {
          return;
        }

        return Count.create(countProps)
          .then(function(count) {

            var parentType;

            switch (options.type) {
            case 'hourOfYear':
              parentType = 'dayOfYear';
              break;
            case 'dayOfYear':
              parentType = 'week';
              break;
            case 'week':
              parentType = 'month';
              break;
            case 'month':
              parentType = 'year';
              break;
            }

            if (parentType) {

              var utc = moment().utc().year(options.year);
              var parentKey = utc[options.type](options.key)[parentType]();


              return instance.getCount({
                type: parentType,
                key: parentKey,
                year: options.year,
                create: true
              })
                .then(function(parent) {
                  count.parentId = parent.id;
                  return count.save();
                });

            }

            return count;

          });
      });
  };
};

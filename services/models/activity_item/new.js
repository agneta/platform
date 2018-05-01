var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

module.exports = function(Model, app) {

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

        data = app.helpers.limitObject(data, {
          depth: 4
        });

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
        //console.log('----------------------',createOptions);
        return Model.create(createOptions);

      })
      .then(function(activity) {

        Promise.map(feeds, function(feed) {
          return feed.onUpdate(activity);
        });
        return activity;

      });
  };
};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/limiter.js
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
var ExpressBrute = require('express-brute');
var MongoStore = require('express-brute-mongo');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(app, config) {

  var messages = {
    limitReached: {
      title: {
        gr: 'Έχετε υπερβεί το όριο',
        en: 'Limit reached'
      },
      text: {
        gr: 'Έχετε κάνει πολλές προσπάθειες σε σύντομο χρονικό διάστημα, δοκιμάστε ξανά ',
        en: 'You\'ve made too many attempts in a short period of time, please try again '
      }
    }
  };

  var configLimiter = app.web.services.get('limiter');

  app.locals.limiters = app.locals.limiters || {};

  var store = new MongoStore(function(ready) {
    var datasource = app.dataSources.db;
    datasource.on('connected',function(){
      ready(datasource.connector.db.collection('Limiter'));
    });
  });

  var limiter = new ExpressBrute(store,
    _.extend({
      failCallback: failCallback
    }, config.options));

  limiter.name = config.name;
  limiter.title = config.title;

  app.locals.limiters[limiter.name] = limiter;

  function failCallback(req, res, next, nextValidRequestDate) {

    var message = messages.limitReached;
    var lng = app.getLng(req);
    switch (lng) {
      case 'gr':
        lng = 'el';
        break;
      default:

    }
    moment.locale(lng);

    res.status(429).send({
      title: app.lng(message.title, req),
      message: app.lng(message.text, req) + moment(nextValidRequestDate).fromNow(),
      nextValidRequestDate: nextValidRequestDate
    });

  }

  return function(req, res, next) {
    if (!config.isGlobal && configLimiter.whitelist.indexOf(req.ip) >= 0) {
      next();
      return;
    }
    limiter.prevent(req, res, next);
  };
};

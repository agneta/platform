/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/transport-logger.js
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
var util = require('util'),
  Transport = require('winston-transport');

var StackTraceParser = require('stacktrace-parser');
var _ = require('lodash');

module.exports = function(app) {
  var Logger = function(options) {
    Transport.call(this, options);
    options = options || {};

    this.errorOutput = [];
    this.writeOutput = [];

    this.json = options.json || false;
    this.colorize = options.colorize || false;
    this.prettyPrint = options.prettyPrint || false;
    this.timestamp =
      typeof options.timestamp !== 'undefined' ? options.timestamp : false;
    this.showLevel = options.showLevel === undefined ? true : options.showLevel;
    this.label = options.label || null;
    this.depth = options.depth || null;

    if (this.json) {
      this.stringify =
        options.stringify ||
        function(obj) {
          return JSON.stringify(obj, null, 2);
        };
    }
  };

  //
  // Inherit from `winston.Transport`.
  //
  util.inherits(Logger, Transport);

  //
  // Expose the name of this Transport on the prototype
  //
  Logger.prototype.name = 'agneta-activities';

  //
  // ### function log (level, msg, [meta], callback)
  // #### @level {string} Level at which to log the message.
  // #### @msg {string} Message to log
  // #### @meta {Object} **Optional** Additional metadata to attach
  // #### @callback {function} Continuation to respond to when complete.
  // Core logging method exposed to Winston. Metadata is optional.
  //
  Logger.prototype.log = function(level, msg, data, callback) {
    var action;

    if (data instanceof Error) {
      data = {
        columnNumber: data.columnNumber,
        fileName: data.fileName,
        lineNumber: data.lineNumber,
        message: data.message,
        name: data.name,
        stack: data.stack
      };
    }

    if (data.error && data.error.code) {
      action = data.error.code;
    }

    if (data.stack && _.isString(data.stack)) {
      data.stack = StackTraceParser.parse(data.stack);
    }

    var dataShow = _.extend({}, data);
    delete dataShow.req;

    if (!this.silent) {
      console.error(util.inspect(dataShow, { colors: true, depth: 3 }));
    }

    if (!action) {
      action = 'SERVER_ERROR';
    }

    switch (action) {
      case 'AUTHORIZATION_REQUIRED':
        return;
    }

    var feeds = [];

    if (data.req) {
      feeds.push({
        value: data.req.dataParsed.path,
        type: `${level}_request`
      });
    } else {
      feeds.push({
        value: action,
        type: `${level}_system`
      });
    }

    var accountId = data.uid;
    var options = {
      accountId: accountId,
      feeds: feeds,
      req: data.req,
      action: level,
      data: dataShow
    };
    if (app.models.Activity_Item && app.models.Activity_Item.new) {
      app.models.Activity_Item.new(options);
    }

    callback(null, true);
  };

  return Logger;
};

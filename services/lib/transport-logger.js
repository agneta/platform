var util = require('util'),
    Transport = require('winston/lib/winston/transports/transport').Transport;

var StackTraceParser = require('stacktrace-parser');
var _ = require("lodash");

module.exports = function(app) {

    var Logger = function(options) {

        Transport.call(this, options);
        options = options || {};

        this.errorOutput = [];
        this.writeOutput = [];

        this.json = options.json || false;
        this.colorize = options.colorize || false;
        this.prettyPrint = options.prettyPrint || false;
        this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false;
        this.showLevel = options.showLevel === undefined ? true : options.showLevel;
        this.label = options.label || null;
        this.depth = options.depth || null;

        if (this.json) {
            this.stringify = options.stringify || function(obj) {
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
    Logger.prototype.name = 'memory';

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
            console.error(JSON.stringify(dataShow, null, 4));
        }

        if (!action) {
            action = 'SERVER_ERROR';
        }

        switch (action) {
            case 'AUTHORIZATION_REQUIRED':
                return;
        }

        var accountId = data.uid;
        var options = {
            accountId: accountId,
            feed: level,
            req: data.req,
            action: {
                value: action,
                type: level
            },
            data: dataShow
        };
        if (app.models.Activity_Item && app.models.Activity_Item.new) {
            app.models.Activity_Item.new(options);
        }

        callback(null, true);
    };

    return Logger;
};

var StackTraceParser = require('stacktrace-parser');
var _ = require("lodash");

Error.stackTraceLimit = 10;

module.exports = function(app) {

    app.get('remoting').errorHandler = {

        handler: function(error, req, res, next) {
            var errorLog;

            if (error instanceof Error) {
                errorLog = _.extend({}, error, {
                    name: error.name,
                    message: error.message,
                    stack: StackTraceParser.parse(error.stack)
                });

                delete error.stack;
            }
            else {
                errorLog = error;
            }

            var uid = (req.accessToken && req.accessToken.userId) || 'guest';

            app.logger.error(errorLog.message || errorLog.code || errorLog.name || 'Error' , {
                uid: uid,
                error: errorLog,
                req: req
            });

            next();
        },
        debug: false
    };

};

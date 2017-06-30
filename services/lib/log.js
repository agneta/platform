var winston = require('winston');
var processListening = false;

module.exports = function(app) {

    var TransportLogger = require("./transport-logger")(app);

    var logOptions = {
        handleExceptions: true,
        prettyPrint: true,
        json: false
    };

    var logger = new(winston.Logger)({
        transports: [
            new TransportLogger(logOptions)
        ],
        exitOnError: false
    });

    //------------------------------------------------

    //------------------------------------------------

    if (!processListening) {

        processListening = true;

        process.on('exit', function(code) {
            logger.warn('About to exit with code:', code);
        });

        process.on('warning', function(warning) {
            logger.warn(warning);
        });

        process.on('unhandledRejection', function(reason, p) {
            logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
        });

    }

    app.logger = logger;
    return logger;

};

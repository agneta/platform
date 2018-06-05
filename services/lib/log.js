/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/log.js
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
var winston = require('winston');
var processListening = false;

module.exports = function(app) {

  var TransportLogger = require('./transport-logger')(app);

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
      logger.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
    });

  }

  app.logger = logger;
  return logger;

};

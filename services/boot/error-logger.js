/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/error-logger.js
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
var StackTraceParser = require('stacktrace-parser');
var _ = require('lodash');

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
        uid: uid+'',
        error: errorLog,
        req: req
      });

      next();
    },
    debug: false
  };

};

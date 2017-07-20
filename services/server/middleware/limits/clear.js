/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/middleware/limits/clear.js
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
module.exports = function(app, options) {
  return function(req, res, next) {

    var limiter = app.locals.limiters[req.params.name];
    if (!limiter) {
      return res.send({
        error: 'Limiter not found'
      });
    }

    limiter.reset(req.ip, null, function() {
      res.send('Cleared Limits on: ' + limiter.title);
    });
  };
};

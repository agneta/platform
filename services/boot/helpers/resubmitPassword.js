/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/helpers/resubmitPassword.js
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
module.exports = function(app) {
  return function(ctx, user, next) {

    var accessToken = ctx.req.accessToken;

    // Skip password confirmation for short term tokens
    if (accessToken.ttl < 1000) {
      return next();
    }

    var body = ctx.req.body;
    var password = body.password || body.password_old;

    if (!password) {
      return next({
        code: 'CONFIRM_PASS_REQUIRED',
        message: 'Password is required'
      });
    }

    app.models.Account.findById(accessToken.userId)
      .then(function(currentUser) {
        return currentUser.hasPassword(password);
      })
      .then(function(isMatch) {
        if (!isMatch) {
          return next({
            code: 'CONFIRM_PASS_WRONG',
            message: 'Could not confirm your request because you entered a wrong password'
          });
        }
        next();
      })
      .catch(next);
  };
};

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/activity.js
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
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.activity = function(options) {

    var type = 'engagement';
    var data = _.extend({}, options.data);
    var accountId = options.accountId || (options.req.accessToken && options.req.accessToken.userId);

    app.models.Activity_Item.new({
      accountId: accountId,
      feed: type,
      req: options.req,
      action: {
        value: options.action,
        type: type
      },
      data: data
    });

  };

};

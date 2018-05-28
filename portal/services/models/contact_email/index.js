/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/email_template.js
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
module.exports = function(Model, app) {

  Model.io = app.socket.namespace({
    name: 'email',
    auth: {
      allow: [
        'administrator',
        'editor'
      ]
    }
  });

  Model.__email = app.web.services.get('email');

  require('./inbox/list')(Model,app);
  require('./inbox/accounts')(Model,app);

  require('./template/list')(Model,app);
  require('./template/render')(Model,app);
  require('./template/onEdit')(Model,app);

  require('./send')(Model,app);
};

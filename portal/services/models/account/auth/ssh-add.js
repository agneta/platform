/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/ssh/add.js
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
module.exports = function(Model,app) {


  Model.sshAdd = function(accountId, title, content) {

    return Model.__get(accountId)
      .then(function(account) {

        return account.ssh.create({
          title: title,
          content: content,
          createdAt: new Date()
        });

      })
      .then(function(key) {
        return {
          message: 'SSH Key added to account',
          key: key
        };
      });

  };

  var fields = app.form.fields({
    form: 'ssh-add-key'
  });

  Model.beforeRemote('sshAdd',  app.form.check(fields));

  Model.remoteMethod(
    'sshAdd', {
      description: 'Activate Account with given ID',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'title',
        type: 'string',
        required: true
      }, {
        arg: 'content',
        type: 'string',
        required: true
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/ssh-add'
      }
    }
  );


};

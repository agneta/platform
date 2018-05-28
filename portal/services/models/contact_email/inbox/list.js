/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/email_template/getAll.js
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

  Model.inboxList = function(addressId) {

    return app.models.Contact_Email_Address.find({
      where:{
        type: 'to',
        addressId: addressId
      },
      order: 'date DESC',
      include:{
        relation: 'email',
        scope: {
          fields: ['subject','date','from']
        }
      }
    })
      .then(function(result) {
        return {
          list: _.map(result,function(item){
            return item.__data.email;
          })
        };
      });

  };

  Model.remoteMethod(
    'inboxList', {
      description: 'Return inbox',
      accepts: [{
        arg: 'addressId',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/inbox-list'
      }
    }
  );

};

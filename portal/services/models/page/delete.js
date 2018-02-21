/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/page/delete.js
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
var fs = require('fs-extra');

module.exports = function(Model) {

  Model.delete = function(id) {
    return Model.getPage(id)
      .then(function(page) {
        var source = Model.pageSource(page);
        //console.log(source);
        return fs.remove(source);
      })
      .then(function() {
        return {
          message: 'Page deleted'
        };
      });
  };

  Model.remoteMethod(
    'delete', {
      description: 'Delete a file',
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/delete'
      },
    }
  );

};

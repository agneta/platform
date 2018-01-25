/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: portal/services/models/edit_data/loadCommit.js
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

  Model.loadCommit = function(id, commit) {

    return app.models.History.findById(commit,{
      fields:{
        data: true,
        refId: true
      }
    })
      .then(function(result){
        if(result.refId != id){
          return Promise.reject({
            statusCode: 400,
            message: 'The Id for the version does not match the item.'
          });
        }

        return {
          data: result.data
        };

      });
  };

  Model.remoteMethod(
    'loadCommit', {
      description: 'load file add a specific commit',
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      }, {
        arg: 'commit',
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
        path: '/load-commit'
      },
    }
  );

};

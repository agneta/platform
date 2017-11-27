/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/process/changes/refresh.js
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

  var config = app.get('git');

  Model.changesRefresh = function() {

    var branchName = app.git.branch.current;

    return app.git.native.fetch(config.remote.name, branchName)
      .then(function(result) {
        return {
          success: `Fetched changes from remote ${result.remote} on branch ${branchName}`
        };
      });
  };



  Model.remoteMethod(
    'changesRefresh', {
      description: '',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/changes-refresh'
      }
    }
  );

};

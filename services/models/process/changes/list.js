/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/process/changes/list.js
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
const S = require('string');

module.exports = function(Model, app) {

  var config = app.get('git');

  Model.changesList = function() {

    var branchName = app.git.branch.current;
    var remoteBranch = `${config.remote.name}/${branchName}`;
    var behind;
    var ahead;
    var remoteLog;

    return Promise.resolve()
      .then(function() {
        return app.git.native.raw(['rev-list', '--left-right', '--count', `${remoteBranch}...${branchName}`]);
      })
      .then(function(commitCount) {
        commitCount = S(commitCount).strip('\n').s.split('\t');
        behind = parseFloat(commitCount[0]);
        ahead = parseFloat(commitCount[1]);
        return app.git.native.log(['--max-count', '3', '--remotes', remoteBranch]);
      })
      .then(function(_remoteLog) {
        remoteLog = _remoteLog;

        for (var commit of remoteLog.all) {
          commitFix(commit);
        }

        return app.git.native.log(['-1']);
      })
      .then(function(localLog) {

        commitFix(localLog.latest);

        return {
          branch: {
            local: branchName,
            remote: remoteBranch
          },
          behind: behind,
          ahead: ahead,
          shortLog: remoteLog.all,
          current: localLog.latest
        };
      });

    function commitFix(commit) {
      var message = commit.message.split(' (');
      commit.message = message[0];
      var point = message[1];
      if (point) {
        commit.point = `(${point}`;
      }
    }
  };



  Model.remoteMethod(
    'changesList', {
      description: '',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/changes-list'
      }
    }
  );

};

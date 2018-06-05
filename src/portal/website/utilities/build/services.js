/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/build/services.js
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
var AWS = require('aws-sdk');

module.exports = function(util){

  var codebuild = new AWS.CodeBuild();
  var config = util.app.get('aws');

  util.log('get project from code deploy');
  return codebuild.batchGetProjects({
    names: [
      config.codebuild.project
    ]
  })
    .promise()
    .then(function(result) {
      var project = result.projects[0];
      if (!project) {
        throw new Error('Could not find project in AWS CodeBuild');
      }

      util.log(`Building from ${project.source.type} with location ${project.source.location}`);
      //console.log(project);

      return codebuild.startBuild({
        projectName: project.name,
      }).promise();

    })
    .then(function(result) {
      var build = result.build;

      var bar = util.progress(10, {
        title: 'AWS CodeBuild'
      });

      return new Promise(function(resolve, reject) {

        function check() {
          setTimeout(function() {

            codebuild.batchGetBuilds({
              ids: [build.id]
            })
              .promise()
              .then(function(result) {

                var state = result.builds[0];
                var count = 0;
                var duration = 0;
                var failed = [];
                var succeeded = [];
                //console.log(state.phases);
                if(state.phases && state.phases.length){
                  for (var phase of state.phases) {
                    switch(phase.phaseStatus){
                      case 'SUCCEEDED':
                        count++;
                        succeeded.push(phase);
                        break;
                      case 'FAILED':
                        failed.push(phase);
                        break;
                    }
                    if(phase.durationInSeconds){
                      duration += parseFloat(phase.durationInSeconds);
                    }
                  }
                }

                var title = `Status: ${state.buildStatus}. Current phase: ${state.currentPhase}. Duration: ${duration} seconds. ${failed.length} phases failed and ${succeeded.length} succeeded`;
                bar.emit({
                  count: count,
                  length: state.phases.length
                }, {
                  title: title
                });

                switch (state.buildStatus) {
                  case 'SUCCEEDED':
                    return resolve();
                  case 'IN_PROGRESS':
                    break;
                  default:
                    util.error(state);
                    return reject({
                      message: `CodeBuild did not complete with status: ${state.buildStatus}`
                    });
                }

                check();
              })
              .catch(function(err) {
                reject(err);
              });

          }, 1000);
        }

        check();

      });
    });

};
